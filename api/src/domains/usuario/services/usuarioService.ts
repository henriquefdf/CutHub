import { Request, Response } from "express";
import prisma from "../../../../config/prismaClient";
import { Usuario } from "@prisma/client";
import { QueryError } from "../../../../errors/QueryError";
import { NotAuthorizedError } from "../../../../errors/NotAuthorizedError";
import { hash } from "bcrypt";



class UsuarioService {

    async encryptPassword(password: string) {
        const saltRounds = 10;
        return await hash(password, saltRounds);
    }


    async criar(body: Usuario,) {

        if(await prisma.usuario.findUnique({ where: { email: body.email } })) {
            throw new QueryError('Email já cadastrado.');
        }

        body.senha = await this.encryptPassword(body.senha);

        const novoUsuario = await prisma.usuario.create({
            data: { 
                nome: body.nome,
                email: body.email,
                senha: body.senha,
                tipo: body.tipo
            }
        });
        return novoUsuario;
    }

    async getUsuario(id: number) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: id }
        });
        return usuario;
    }

    async getListaUsuarios() {
        const usuarios = await prisma.usuario.findMany();
        return usuarios;
    }

}


export default new UsuarioService();