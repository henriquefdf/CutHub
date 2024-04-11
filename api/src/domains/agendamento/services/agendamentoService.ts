import prisma from "../../../../config/prismaClient";
import { NotAuthorizedError } from "../../../../errors/NotAuthorizedError";
import { Agendamento } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns"

type AgendamentoInterface = Omit<Agendamento, 'id'> & {
  id?: number;
  servicoId: number;
};

type CondicoesDeBusca = {
    usuarioId: number;
    data?: {
        lte?: Date;
        gte?: Date;
    };
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

    async listarAgendamentosCliente(usuarioId: number, finalizado: string) {
        const dataAtual = new Date();
    
        const condicoes: CondicoesDeBusca = {
            usuarioId: usuarioId,
        };

        const finalizadoBool = +finalizado !== 0;

        let ordem: 'asc' | 'desc';

        if (finalizadoBool) {
            condicoes.data = { lte: dataAtual };
            ordem = 'desc';
        } else {
            condicoes.data = { gte: dataAtual };
            ordem = 'asc'
        }
    
        const agendamentos = await prisma.agendamento.findMany({
            where: condicoes,
            orderBy: {
                data: ordem,
            },
        });
    
        const agendamentosComServico = await Promise.all(agendamentos.map(async (agendamento) => {
            const servico = await prisma.servico.findFirst({
                where: {
                    id: agendamento.servicoId
                }
            });
    
            const barbearia = await prisma.barbearia.findFirst({
                where: {
                    id: agendamento.barbeariaId
                }
            });
    
            return {
                ...agendamento,
                servico: servico,
                barbearia: barbearia
            };
        }));
    
        return agendamentosComServico;
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

    async listarAgendamentosBarbeariaData(barbeariaId: string, data: Date){
        const agendamentos = await prisma.agendamento.findMany({
            where: {
                barbeariaId: +barbeariaId,
                data: {
                    lte: endOfDay(data),
                    gte: startOfDay(data)
                }
            }
        });

        return agendamentos;
    }
}

export default new agendamentoService();