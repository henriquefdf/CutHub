import { jest } from '@jest/globals';
import prisma from '../../../../config/prismaClient';
import servicoService from './servicoService';
import { deleteObject } from '../../../../utils/functions/aws';
import { NextFunction } from 'express';

// Mocking necessary modules
jest.mock('multer-s3', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    single: jest.fn().mockReturnValue((req: any, res: Response, next: NextFunction) => {
      req.file = { location: 'http://exemplo.com/foto.jpg', key: 'chave-s3' };
      next();
    })
  })),
}));

jest.mock('../../../../config/prismaClient', () => ({
  __esModule: true,
  default: {
    servico: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
    },
    barbearia: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('../../../../utils/functions/aws', () => ({
  deleteObject: jest.fn(),
}));

describe('servicoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar um novo serviço', async () => {
    const body = {
      nome: 'Barba',
      descricao: 'Corte de barba',
      preco: 50,
    };

    const barbearia = {
        nome: 'Barbearia do João',
        endereco: 'Rua do João, 123',
        telefone: '123456789',
        foto: 'http://exemplo.com/foto.jpg',
        chaveAws: 'chave-s3',
        usuarioId: 1,
    };
 
    const idBarbearia = 1;
    const donoId = 1;
    const file = {
      location: 'http://exemplo.com/foto.jpg',
      key: 'chave-s3'
    };

    jest.mocked(prisma.barbearia.findFirst).mockResolvedValue({
      id: idBarbearia,
      ... barbearia,
    });

    jest.mocked(prisma.servico.findFirst).mockResolvedValue(null);

    jest.mocked(prisma.servico.create).mockResolvedValue({
      id: 1,
      ...body,
      foto: file.location,
      chaveAws: file.key,
      barbeariaId: 1,
    });

    const resultado = await servicoService.criarServico({
        nome: body.nome,
        descricao: body.descricao,
        preco: +body.preco,
        id: idBarbearia,
        foto: null,
        chaveAws: null,
    }, donoId, file);

    expect(resultado).toEqual({
      id: 1,
      ...body,
      foto: file.location,
      chaveAws: file.key,
      barbeariaId: 1,
    });
  });
  it('deve atualizar um serviço', async () => {
    const body = {
      nome: 'Barba',
      descricao: 'Corte de barba',
      preco: 50,
    };

    const servicoId = 1;
    const donoId = 1;
    const file = {
      location: 'http://exemplo.com/foto.jpg',
      key: 'chave-s3'
    };

    jest.mocked(prisma.servico.findFirst).mockResolvedValue({
      id: servicoId,
      ...body,
      foto: file.location,
      chaveAws: file.key,
      barbeariaId: 1,
    });

    jest.mocked(prisma.servico.update).mockResolvedValue({
      id: 1,
      ...body,
      foto: file.location,
      chaveAws: file.key,
      barbeariaId: 1,
    });

    const resultado = await servicoService.editarServico({
        nome: body.nome,
        descricao: body.descricao,
        preco: +body.preco,
        id: servicoId,
        foto: null,
        chaveAws: null,
    }, donoId, file);

    expect(resultado).toEqual({
      id: 1,
      ...body,
      foto: file.location,
      chaveAws: file.key,
      barbeariaId: 1,
    });
  });

    it('deve deletar um serviço', async () => {
        const servicoId = 1;
        const donoId = 1;
    
        jest.mocked(prisma.servico.findFirst).mockResolvedValue({
        id: servicoId,
        nome: 'Barba',
        descricao: 'Corte de barba',
        preco: 50,
        foto: 'http://exemplo.com/foto.jpg',
        chaveAws: 'chave-s3',
        barbeariaId: 1,
        });
    
        jest.mocked(prisma.barbearia.findFirst).mockResolvedValue({
        id: 1,
        nome: 'Barbearia do João',
        endereco: 'Rua do João, 123',
        foto: 'http://exemplo.com/foto.jpg',
        chaveAws: 'chave-s3',
        usuarioId: 1,
        });
    
        await servicoService.deletarServico(servicoId, donoId);
    
        expect(prisma.servico.findFirst).toHaveBeenCalledTimes(1);
        expect(prisma.servico.findFirst).toHaveBeenCalledWith({
        where: { id: servicoId }
        });
    
        expect(prisma.barbearia.findFirst).toHaveBeenCalledTimes(1);
        expect(prisma.barbearia.findFirst).toHaveBeenCalledWith({
        where: { usuarioId: donoId }
        });
    
        expect(prisma.servico.delete).toHaveBeenCalledTimes(1);
        expect(prisma.servico.delete).toHaveBeenCalledWith({
        where: { id: servicoId }
        });
    
    });

    it('deve listar os serviços de uma barbearia', async () => {
        const idBarbearia = 1;
    
        jest.mocked(prisma.servico.findMany).mockResolvedValue([
        {
            id: 1,
            nome: 'Barba',
            descricao: 'Corte de barba',
            preco: 50,
            foto: 'http://exemplo.com/foto.jpg',
            chaveAws: 'chave-s3',
            barbeariaId: 1,
        },
        {
            id: 2,
            nome: 'Cabelo',
            descricao: 'Corte de cabelo',
            preco: 30,
            foto: 'http://exemplo.com/foto.jpg',
            chaveAws: 'chave-s3',
            barbeariaId: 1,
        },
        ]);
    
        const resultado = await servicoService.listarServicosBarbearia(idBarbearia);
    
        expect(resultado).toEqual([
        {
            id: 1,
            nome: 'Barba',
            descricao: 'Corte de barba',
            preco: 50,
            foto: 'http://exemplo.com/foto.jpg',
            chaveAws: 'chave-s3',
            barbeariaId: 1,
        },
        {
            id: 2,
            nome: 'Cabelo',
            descricao: 'Corte de cabelo',
            preco: 30,
            foto: 'http://exemplo.com/foto.jpg',
            chaveAws: 'chave-s3',
            barbeariaId: 1,
        },
        ]);
    
        expect(prisma.servico.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.servico.findMany).toHaveBeenCalledWith({
        where: { barbeariaId: idBarbearia }
        });
    });
});

