import prisma from "../../../../config/prismaClient";
import { Usuario } from "@prisma/client";
import { QueryError } from "../../../../errors/QueryError";
import { hash } from "bcrypt";
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import crypto from 'crypto';
import { enviaEmail } from "../../../../utils/functions/enviaEmail";
import { deleteObject } from "../../../../utils/functions/aws";

class UsuarioService {

    async encryptPassword(password: string) {
        const saltRounds = 10;
        return await hash(password, saltRounds);
    }

    async criar(body: Usuario, foto: Express.Multer.File) {

        if(await prisma.usuario.findUnique({ where: { email: body.email } })) {
            throw new QueryError('Email já cadastrado.');
        }

        body.senha = await this.encryptPassword(body.senha);

        const novoUsuario = await prisma.usuario.create({
            data: { 
                nome: body.nome,
                email: body.email,
                senha: body.senha,
                tipo: body.tipo,
                foto: (foto as Express.MulterS3.File)?.location,
                chaveAws: (foto as Express.MulterS3.File)?.key,
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

    async updateUsuario(body: Usuario, usuarioLogado: Usuario, foto: Express.Multer.File | Express.MulterS3.File) {

        const findUser = await prisma.usuario.findUnique({
            where: { id: usuarioLogado.id }
        });

        if(body.senha) {
            body.senha = await this.encryptPassword(body.senha);
        }
        if (foto) {
            deleteObject(findUser?.chaveAws!);
            body.foto = (foto as Express.MulterS3.File).location;
            body.chaveAws = (foto as Express.MulterS3.File).key;
        } else {
            body.foto = findUser?.foto || null;
            body.chaveAws = findUser?.chaveAws || null;
        }
  
        const usuario = await prisma.usuario.update({
            where: { id: usuarioLogado.id },
            data: body
        });
        return usuario;
    }

    async deleteUsuario(usuarioLogado: Usuario) {


        const usuario = await prisma.usuario.delete({
            where: { id: usuarioLogado.id }
        });
        return usuario;
    }

    async updatePassword(password: string, id: number) {
        const newPass = await this.encryptPassword(password);

        await prisma.usuario.update({
            where: {
                id: id,
            },
            data: {
                senha: newPass,
            },
        });

        return;
    }

    async validateToken(email: string, token: string, password: string) {
        
        const user = await prisma.usuario.findFirst({where: {email: email}});
        const timeNow = new Date();

        if ((user?.tokenRecPass != token) || (user.dateRecPass != null && timeNow > user.dateRecPass)) {
            throw new InvalidParamError('Token Inválido, verifique seus dados e tente novamente!');
        }

        await this.updatePassword(password, user.id);
        return;
    }

    async createToken(email: string) {
        const user = await prisma.usuario.findFirst({ 
            where: {
                email: email
            }
        });

        if (user == null) {
            throw new QueryError('E-mail para recuperação de senha inválido.');
        }

        const token: string = crypto.randomBytes(3).toString('hex');
        const date = new Date();
        date.setHours(date.getHours() + 1);

        await prisma.usuario.update({
            where: {
                email: email,
            },
            data: {
                tokenRecPass: token,
                dateRecPass: date,
            }
        });

        await enviaEmail(email, token, 'Recuperação de Senha', 'Aqui está o seu código para recuperação de senha! Lembre-se de não compartilhar esse código com ninguém.');
    }

}


export default new UsuarioService();
