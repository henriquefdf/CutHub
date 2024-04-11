import agendamentoService from "./agendamentoService";
import { NotAuthorizedError } from "../../../../errors/NotAuthorizedError";
import prisma from "../../../../config/prismaClient";
import { jest } from '@jest/globals';
import { Agendamento, Barbearia, Servico, Usuario} from "@prisma/client";




jest.mock("../../../../config/prismaClient", () => ({
  servico: {
    findFirst: jest.fn(),
  },
  usuario: {
    findFirst: jest.fn(),
  },
  barbearia: {
    findFirst: jest.fn(),
  },
  agendamento: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
}));

type AgendamentoInterface = Omit<Agendamento, 'id'> & {
  id?: number;
  servicoId: number;
};

describe("AgendamentoService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar uma lista de agendamentos do Cliente", async () => {

    const usuario = {
      id: 15,
      nome: "Cliente Teste",
      email: "userteste@gmail.com",
      senha: "123456",
    } as Usuario;

    const agendamentos = [
      {
        id: 4,
        data: new Date(),
        servicoId: 777,
        barbeariaId: 1,
        usuarioId: 15,
      },
      {
        id: 5,
        data: new Date(),
        servicoId: 25,
        barbeariaId: 177,
        usuarioId: 15,
      },
    ] as Agendamento[];

    jest.mocked(prisma.usuario.findFirst).mockResolvedValue(usuario);
    jest.mocked(prisma.agendamento.findMany).mockResolvedValue(agendamentos);

    const resultado = await agendamentoService.listarAgendamentosCliente(15, "0");
    console.log(resultado);
    expect(resultado).toEqual(agendamentos);
  });



  it("deve criar um novo agendamento", async () => {
      const body = {
        data: new Date(),
        servicoId: 1,
      } as AgendamentoInterface;

      const servico = {
        id: 1,
        nome: "Corte",
        descricao: "Descrição do serviço",
        preco: 50,
        foto: null,
        chaveAws: null,
        barbeariaId: 1,
      } as Servico;
      const barbearia = {
        id: 1,
        nome: "Barbearia do Teste",
        endereco: "Rua dos Testes, 123",
        foto: "http://exemplo.com/foto.jpg",
        chaveAws: "chave-s3",
        usuarioId: 1,
      }as Barbearia;

      const agendamento = {
        id: 1,
        data: body.data,
        servicoId: body.servicoId,
        barbeariaId: barbearia.id,
        usuarioId: 1,
      }as Agendamento;

      jest.mocked(prisma.servico.findFirst).mockResolvedValue(servico);
      jest.mocked(prisma.barbearia.findFirst).mockResolvedValue(barbearia);
      jest.mocked(prisma.agendamento.findFirst).mockResolvedValue(null);
      jest.mocked(prisma.agendamento.create).mockResolvedValue(agendamento);

      const resultado = await agendamentoService.criarAgendamento(body, 1);
      expect(resultado).toEqual(agendamento);
    
  });

  it("deve retornar erro se a barbearia não for encontrada", async () => {
    const body = {
      data: new Date(),
      servicoId: 1,
    } as AgendamentoInterface;

    const servico = {
      id: 1,
      nome: "Corte",
      descricao: "Descrição do serviço",
      preco: 50,
      foto: null,
      chaveAws: null,
      barbeariaId: 1,
    } as Servico;

    jest.mocked(prisma.servico.findFirst).mockResolvedValue(servico);
    jest.mocked(prisma.barbearia.findFirst).mockResolvedValue(null);

    await expect(agendamentoService.criarAgendamento(body, 1)).rejects.toThrow(new NotAuthorizedError("Barbearia não encontrada."));
  });

  it("deve retornar erro se já existir um agendamento nesse horário", async () => {
    const body = {
      data: new Date(),
      servicoId: 1,
    } as AgendamentoInterface;

    const servico = {
      id: 1,
      nome: "Corte",
      descricao: "Descrição do serviço",
      preco: 50,
      foto: null,
      chaveAws: null,
      barbeariaId: 1,
    } as Servico;
    const barbearia = {
      id: 1,
      nome: "Barbearia do Teste",
      endereco: "Rua dos Testes, 123",
      foto: "http://exemplo.com/foto.jpg",
      chaveAws: "chave-s3",
      usuarioId: 1,
    }as Barbearia;

    const agendamento = {
      id: 1,
      data: body.data,
      servicoId: body.servicoId,
      barbeariaId: barbearia.id,
      usuarioId: 1,
    }as Agendamento;

    jest.mocked(prisma.servico.findFirst).mockResolvedValue(servico);
    jest.mocked(prisma.barbearia.findFirst).mockResolvedValue(barbearia);
    jest.mocked(prisma.agendamento.findFirst).mockResolvedValue(agendamento);

    await expect(agendamentoService.criarAgendamento(body, 1)).rejects.toThrow(new NotAuthorizedError("Já existe um agendamento nesse horário."));
  });

  it("deve retornar uma lista de agendamentos da Barbearia", async () => {

    const barbearia = {
      id: 1,
      nome: "Barbearia do Teste",
      endereco: "Rua dos Testes, 123",
      foto: "http://exemplo.com/foto.jpg",
      chaveAws: "chave-s3",
      usuarioId: 1,
    }as Barbearia;
    const agendamentos = [
      {
        id: 1,
        data: new Date(),
        servicoId: 1,
        barbeariaId: 1,
        usuarioId: 1,
      },
      {
        id: 2,
        data: new Date(),
        servicoId: 2,
        barbeariaId: 1,
        usuarioId: 1,
      },
    ] as Agendamento[];

    jest.mocked(prisma.barbearia.findFirst).mockResolvedValue(barbearia);
    jest.mocked(prisma.agendamento.findMany).mockResolvedValue(agendamentos);

    const resultado = await agendamentoService.listarAgendamentosBarbearia(1);
    expect(resultado).toEqual(agendamentos);
  });

  it("deve deletar um agendamento", async () => {

    const barbearia = {
      id: 1,
      nome: "Barbearia do Teste",
      endereco: "Rua dos Testes, 123",
      foto: "http://exemplo.com/foto.jpg",
      chaveAws: "chave-s3",
      usuarioId: 1,
    }as Barbearia;

    const agendamento = {
      id: 1,
      data: new Date(),
      servicoId: 1,
      barbeariaId: 1,
      usuarioId: 1,
    } as Agendamento;

    jest.mocked(prisma.barbearia.findFirst).mockResolvedValue(barbearia);
    jest.mocked(prisma.agendamento.findFirst).mockResolvedValue(agendamento);
    jest.mocked(prisma.agendamento.delete).mockResolvedValue(agendamento);

    const resultado = await agendamentoService.deletarAgendamento(1, 1);
    expect(resultado).toEqual(agendamento);
  });



});

