import prisma from "../../../../config/prismaClient";
import { NotAuthorizedError } from "../../../../errors/NotAuthorizedError";
import { Agendamento } from "@prisma/client";

type AgendamentoInterface = Omit<Agendamento, 'id'> & {
  id?: number;
  servicoId: number;
};

export class agendamentoService {
    async criarAgendamento(body: AgendamentoInterface, usuarioId: number){

        const servico = await prisma.servico.findFirst({
            where: {
                id: +body.servicoId
            }
        });

        if(!servico)
            throw new NotAuthorizedError('Serviço não encontrado.');

        const barbearia = await prisma.barbearia.findFirst({
            where: {
                servicos: {
                    some: {
                        id: +body.servicoId
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
                servicoId: +body.servicoId,
                barbeariaId: barbearia.id,
                usuarioId: usuarioId
            }
        });

        return novoAgendamento;
    }

    async listarAgendamentosCliente(usuarioId: number){
        const agendamentos = await prisma.agendamento.findMany({
            where: {
                usuarioId: usuarioId
            }
        });

        return agendamentos;
    }

    async listarAgendamentosBarbearia(donoId: number){
        const barbearia = await prisma.barbearia.findFirst({
            where: {
                usuarioId: donoId
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

    async deletarAgendamento(agendamentoId: number, usuarioId: number){
        const agendamento = await prisma.agendamento.findFirst({
            where: {
                id: agendamentoId
            }
        });

        if(!agendamento)
            throw new NotAuthorizedError('Agendamento não encontrado.');

        if(agendamento.usuarioId !== usuarioId)
            throw new NotAuthorizedError('Você não tem permissão para cancelar esse agendamento.');

        const agendamentoCancelado = await prisma.agendamento.delete({
            where: {
                id: agendamentoId
            }
        });

        return agendamentoCancelado;
    }
}

export default new agendamentoService();