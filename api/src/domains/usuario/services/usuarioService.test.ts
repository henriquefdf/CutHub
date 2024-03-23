import { hash } from "bcrypt";
import prisma from "../../../../config/prismaClient";
import UsuarioService from './usuarioService';
import { Usuario } from "@prisma/client";

jest.mock("../../../../config/prismaClient", () => ({
  usuario: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock da função hash do bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword")
}));

describe('UsuarioService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('criptografa uma senha', async () => {
    const password = 'password';
    const hashedPassword = await hash(password, 10);
    expect(await UsuarioService.encryptPassword(password)).toEqual(hashedPassword);
  });

  it('cria um novo usuário', async () => {
    const novoUsuario: Usuario = {
      id: 1,
      nome: 'Teste',
      email: 'test@test.com',
      senha: 'password',
      tipo: 'cliente',
      foto: null,
      chaveAws: null,
      tokenRecPass: null,
      dateRecPass: null
    };

    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.usuario.create as jest.Mock).mockResolvedValue(novoUsuario);

    const resultado = await UsuarioService.criar(novoUsuario, {} as Express.Multer.File); // Pass an empty object as the second argument
    expect(resultado).toEqual(novoUsuario);
  });


  it('obtém um usuário pelo id', async () => {
    const usuario: Usuario = {
      id: 1,
      nome: 'Teste',
      email: 'test@test.com',
      senha: 'password',
      tipo: 'cliente',
      foto: null,
      chaveAws: null,
      tokenRecPass: null,
      dateRecPass: null
    };

    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(usuario);

    const resultado = await UsuarioService.getUsuario(1);
    expect(resultado).toEqual(usuario);
  });

  it('obtém uma lista de usuários', async () => {
    const usuarios: Usuario[] = [
      {
        id: 1,
        nome: 'Teste',
        email: 'test@test.com',
        senha: 'password',
        tipo: 'cliente',
        foto: null,
        chaveAws: null,
        tokenRecPass: null,
        dateRecPass: null
      },
      {
        id: 2,
        nome: 'Teste 2',
        email: 'test2@test.com',
        senha: 'password2',
        tipo: 'cliente',
        foto: null,
        chaveAws: null,
        tokenRecPass: null,
        dateRecPass: null
      }
    ];

    (prisma.usuario.findMany as jest.Mock).mockResolvedValue(usuarios);

    const resultado = await UsuarioService.getListaUsuarios();
    expect(resultado).toEqual(usuarios);
  });

  it('atualiza um usuário', async () => {
    const usuario: Usuario = {
      id: 1,
      nome: 'Teste',
      email: 'test@test.com',
      senha: 'password',
      tipo: 'cliente',
      foto: null,
      chaveAws: null,
      tokenRecPass: null,
      dateRecPass: null
    };

    const usuarioAtualizado: Usuario = {
      ...usuario,
      nome: 'Teste Atualizado'
    };

    (prisma.usuario.update as jest.Mock).mockResolvedValue(usuarioAtualizado);

    const resultado = await UsuarioService.updateUsuario(usuarioAtualizado, usuario, {} as Express.Multer.File); // Pass an empty object as the third argument
    expect(resultado).toEqual(usuarioAtualizado);
  });

  it('exclui um usuário', async () => {
    const usuario: Usuario = {
      id: 1,
      nome: 'Teste',
      email: 'test@test.com',
      senha: 'password',
      tipo: 'cliente',
      foto: null,
      chaveAws: null,
      tokenRecPass: null,
      dateRecPass: null
    };

    (prisma.usuario.delete as jest.Mock).mockResolvedValue(usuario);

    const resultado = await UsuarioService.deleteUsuario(usuario); // Pass the required argument
    expect(resultado).toEqual(usuario);
  });

  it('atualiza a senha de um usuário', async () => {
    const usuario: Usuario = {
      id: 1,
      nome: 'Teste',
      email: 'test@test.com',
      senha: 'password',
      tipo: 'cliente',
      foto: null,
      chaveAws: null,
      tokenRecPass: null,
      dateRecPass: null
    };

    const novaSenha = 'novaSenha';
    const senhaCriptografada = await hash(novaSenha, 10);

    (prisma.usuario.update as jest.Mock).mockResolvedValue({ ...usuario, senha: senhaCriptografada });

    await UsuarioService.updatePassword(novaSenha, usuario.id);
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: usuario.id },
      data: { senha: senhaCriptografada }
    });
  });

});


export {}; // Para evitar erros de "Cannot redeclare block-scoped variable" no TypeScript
