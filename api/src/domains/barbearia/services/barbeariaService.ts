import prisma from "../../../../config/prismaClient";
import { NotAuthorizedError } from "../../../../errors/NotAuthorizedError";
import { Barbearia } from "@prisma/client";
import { deleteObject } from "../../../../utils/functions/aws";

type BarbeariaInterface = Omit<Barbearia, 'id' | 'usuarioId'> & {
  foto?: string | null;
  chaveAws?: string | null;
  id?: number;
};

export class barbeariaService {
    
  async criarBarbearia(body: BarbeariaInterface, usuarioId: number, file: any) {
          const novaBarbearia = await prisma.barbearia.create({
            data: {
              nome: body.nome,
              endereco: body.endereco,
              foto: (file as Express.MulterS3.File).location,
              chaveAws: (file as Express.MulterS3.File).key,
              usuarioId: usuarioId,
            },
          });
    
          return novaBarbearia;
      }
    
    
    
    async editarBarbearia(body: BarbeariaInterface, usuarioId: number, file: any) {
        const barbearia = await prisma.barbearia.findFirst({
          where: { usuarioId: +usuarioId }
        });

        console.log(barbearia);

        if(barbearia?.usuarioId !== usuarioId) {
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

        if(!body.id)
          throw new Error('Id da barbearia não informado.');

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

    async listarBarbearias(){
        const barbearias = await prisma.barbearia.findMany();

        return barbearias;
    }

    async listarBarbearia(id: number){
        const barbearia = await prisma.barbearia.findFirst({
            where: { id } ,
            include :{
                servicos: true
            }
        });

        return barbearia;
    }

    async listarBarbeariasPorNome(nome: string){
        const barbearias = await prisma.barbearia.findMany({
            where: {
                nome: {
                    contains: nome,
                }
            }
        });

        return barbearias;
    }


}

export default new barbeariaService();