import prisma from "../../../../config/prismaClient";
import { NotAuthorizedError } from "../../../../errors/NotAuthorizedError";
import { Barbearia } from "@prisma/client";
import { deleteObject } from "../../../../utils/functions/aws";

export class barbeariaService {
    
    async criarBarbearia(body: Barbearia, idUsuario: number, file:any) {
          const novaBarbearia = await prisma.barbearia.create({
            data: {
              nome: body.nome,
              endereco: body.endereco,
              foto: (file as Express.MulterS3.File).location,
              chaveAws: (file as Express.MulterS3.File).key,
              usuarioId: idUsuario,
            },
          });
    
          return novaBarbearia;
      }
    
    async editarBarbearia(body: Barbearia, idUsuario: number, file: any) {
        const barbearia = await prisma.barbearia.findFirst({
          where: { usuarioId: +idUsuario }
        });

        console.log(barbearia);

        if(barbearia?.usuarioId !== idUsuario) {
            throw new NotAuthorizedError('Usuário não autorizado.');
        }

        if(file){
          deleteObject(barbearia?.chaveAws!);
          body.foto = (file as Express.MulterS3.File).location;
          body.chaveAws = (file as Express.MulterS3.File).key;
        }
        else{
          body.foto = barbearia?.foto;
          body.chaveAws = barbearia?.chaveAws;
        }

        const barbeariaAtualizada = await prisma.barbearia.update({
            where: { id: +body.id },
            data: {
                nome: body.nome,
                endereco: body.endereco,
                foto: body.foto,
                chaveAws: body.chaveAws,
            }
        });

        return barbeariaAtualizada;
    }
}

export default new barbeariaService();