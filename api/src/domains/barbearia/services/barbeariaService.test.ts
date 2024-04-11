/* eslint-disable @typescript-eslint/no-explicit-any */
// src/domains/barbearia/services/barbeariaService.test.ts

import { jest } from '@jest/globals';
import prisma from '../../../../config/prismaClient';
import barbeariaService from './barbeariaService';
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
    barbearia: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../../../utils/functions/aws', () => ({
  deleteObject: jest.fn(),
}));

describe('barbeariaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar uma nova barbearia', async () => {
    const body = {
      nome: 'Barbearia do Teste',
      endereco: 'Rua dos Testes, 123',
    };
    const usuarioId = 1;
    const file = {
      location: 'http://exemplo.com/foto.jpg',
      key: 'chave-s3'
    };

    jest.mocked(prisma.barbearia.create).mockResolvedValue({
      id: 1,
      ...body,
      foto: file.location,
      chaveAws: file.key,
      usuarioId: usuarioId,
    });

    const resultado = await barbeariaService.criarBarbearia({
      nome: body.nome,
      endereco: body.endereco,
      foto: file ? (file as Express.MulterS3.File).location : null,
      chaveAws: file ? (file as Express.MulterS3.File).key : null,
    }, usuarioId, file);
    

    expect(prisma.barbearia.create).toHaveBeenCalledWith({
      data: {
        nome: body.nome,
        endereco: body.endereco,
        foto: file.location,
        chaveAws: file.key,
        usuarioId: usuarioId,
      },
    });

    expect(resultado).toEqual({
      id: 1,
      ...body,
      foto: file.location,
      chaveAws: file.key,
      usuarioId: usuarioId,
    });
  });

  describe('barbeariaService', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('deve editar uma barbearia existente com sucesso', async () => {
      const body = {
        id: 1,
        nome: 'Barbearia Editada',
        endereco: 'Rua dos Editados, 456',
        foto: 'http://exemplo.com/nova_foto.jpg',
        chaveAws: 'nova-chave-s3',
      };
      const usuarioId = 1;
      const file = {
        location: 'http://exemplo.com/nova_foto.jpg',
        key: 'nova-chave-s3'
      };
  
      // Mock para encontrar a barbearia existente
      jest.mocked(prisma.barbearia.findFirst).mockResolvedValue({
        id: 1,
        nome: 'Barbearia Original',
        endereco: 'Rua Original, 123',
        foto: 'http://exemplo.com/foto_original.jpg',
        chaveAws: 'chave-original-s3',
        usuarioId: usuarioId,
      });
  
      // Mock para a atualização da barbearia
      jest.mocked(prisma.barbearia.update).mockResolvedValue({
        ...body,
        usuarioId: usuarioId,
      });
  
      const resultado = await barbeariaService.editarBarbearia(body, usuarioId, file);
  
      expect(deleteObject).toHaveBeenCalledWith('chave-original-s3');
      expect(prisma.barbearia.update).toHaveBeenCalledWith({
        where: { id: body.id },
        data: {
          nome: body.nome,
          endereco: body.endereco,
          foto: file.location,
          chaveAws: file.key,
        },
      });
  
      expect(resultado).toEqual({
        ...body,
        usuarioId: usuarioId,
      });
    });
  
    it('deve lançar um erro quando um usuário não autorizado tenta editar uma barbearia', async () => {
      const body = {
        id: 1,
        nome: 'Barbearia Editada',
        endereco: 'Rua dos Editados, 456',
        foto: null,
        chaveAws: null,
      };
      const usuarioId = 2; // ID diferente do usuário da barbearia

      const file = {
        location: 'http://exemplo.com/foto.jpg',
        key: 'chave-s3'
      };
  
      await barbeariaService.criarBarbearia({
        nome: body.nome,
        endereco: body.endereco,
        foto: file ? (file as Express.MulterS3.File).location : null,
        chaveAws: file ? (file as Express.MulterS3.File).key : null,
      }, usuarioId, file);
  
      await expect(barbeariaService.editarBarbearia(body, usuarioId, null)).rejects.toThrow('Usuário não autorizado.');
    });

  });
});
