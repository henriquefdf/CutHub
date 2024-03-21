import { Prisma, Usuario } from "@prisma/client";
import prisma from "../../../../config/prismaClient";
import { QueryError } from "../../../../errors/QueryError";
import { NotAuthorizedError } from "../../../../errors/NotAuthorizedError";
import { Barbearia } from "@prisma/client";

export class barbeariaService {
    
    async criarBarbearia(body: Barbearia, idUsuario: number, file:any) {
          const novaBarbearia = await prisma.barbearia.create({
            data: {
              nome: body.nome,
              endereco: body.endereco,
              foto: (file as Express.MulterS3.File).location,
              usuarioId: idUsuario,
            },
          });
    
          return novaBarbearia;
      }
    
    async editarBarbearia(body: Barbearia, idUsuario: number, file: any) {
        const barbearia = await prisma.barbearia.findUnique({
          where: { id: +body.id }
        });
      
        if(barbearia?.usuarioId !== idUsuario) {
            throw new NotAuthorizedError('Usuário não autorizado.');
        }

        const barbeariaAtualizada = await prisma.barbearia.update({
            where: { id: +body.id },
            data: {
                nome: body.nome,
                endereco: body.endereco,
                foto: (file as Express.MulterS3.File).location,
            }
        });

        return barbeariaAtualizada;
    }
}

export default new barbeariaService();