import prisma from "../../../../config/prismaClient";
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
        const barbearia = await prisma.barbearia.findFirst({
          where: { usuarioId: +idUsuario }
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