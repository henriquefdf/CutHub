import prisma from "../../../../config/prismaClient";
import { NotAuthorizedError } from "../../../../errors/NotAuthorizedError";
import { Agendamento } from "@prisma/client";

type AgendamentoInterface = Omit<Agendamento, 'id'> & {
  id?: number;
  idServico: number;
};

export class agendamentoService {
    async criarAgendamento(body: AgendamentoInterface, idUsuario: number){

        const servico = await prisma.servico.findFirst({
            where: {
                id: +body.idServico
            }
        });

        if(!servico)
            throw new NotAuthorizedError('Serviço não encontrado.');

        const barbearia = await prisma.barbearia.findFirst({
            where: {
                servicos: {
                    some: {
                        id: +body.idServico
                    }
                }
            }
        });

        if(!barbearia)
            throw new NotAuthorizedError('Barbearia não encontrada.');


        const agendamentoExistente = await prisma.agendamento.findFirst({
            where: {
                data: body.data,
                barbeariaId: barbearia.id
            }
        });

        if(agendamentoExistente)
            throw new NotAuthorizedError('Já existe um agendamento nesse horário.');

        const novoAgendamento = await prisma.agendamento.create({
            data: {
                data: body.data,
                servicoId: +body.idServico,
                barbeariaId: barbearia.id,
                usuarioId: idUsuario
            }
        });

        return novoAgendamento;
    }

    async listarAgendamentosCliente(idUsuario: number){
        const agendamentos = await prisma.agendamento.findMany({
            where: {
                usuarioId: idUsuario
            }
        });

        return agendamentos;
    }

    async listarAgendamentosBarbearia(idDono: number){
        const barbearia = await prisma.barbearia.findFirst({
            where: {
                usuarioId: idDono
            }
        });

        if(!barbearia)
            throw new NotAuthorizedError('Barbearia não encontrada.');

        const agendamentos = await prisma.agendamento.findMany({
            where: {
                barbeariaId: barbearia.id
            }
        });

        return agendamentos;
       
    }

    async deletarAgendamento(idAgendamento: number, idUsuario: number){
        const agendamento = await prisma.agendamento.findFirst({
            where: {
                id: idAgendamento
            }
        });

        if(!agendamento)
            throw new NotAuthorizedError('Agendamento não encontrado.');

        if(agendamento.usuarioId !== idUsuario)
            throw new NotAuthorizedError('Você não tem permissão para cancelar esse agendamento.');

        const agendamentoCancelado = await prisma.agendamento.delete({
            where: {
                id: idAgendamento
            }
        });

        return agendamentoCancelado;
    }
}

export default new agendamentoService();