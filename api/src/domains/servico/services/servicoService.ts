import prisma from "../../../../config/prismaClient";
import { NotAuthorizedError} from "../../../../errors/NotAuthorizedError";
import { QueryError } from "../../../../errors/QueryError";
import { Servico } from "@prisma/client";
import { deleteObject } from "../../../../utils/functions/aws";

type ServicoInterface = Omit<Servico, 'barbeariaId'> & {
  foto?: string | null;
  chaveAws?: string | null;
  id?: number;
};

export class servicoService {
    
      async criarServico(body: ServicoInterface, donoId: number, file: any){
        const barbearia = await prisma.barbearia.findFirst({
          where: { usuarioId: donoId }
        });

        if(!barbearia)
          throw new QueryError ('Barbearia não encontrada');

        const servicoExistente = await prisma.servico.findFirst({
          where: { nome: body.nome  , barbeariaId: barbearia.id }
        });

        if(servicoExistente)
          throw new QueryError('Serviço já existe.');

        const novoServico = await prisma.servico.create({
          data: {
            nome: body.nome,
            descricao: body.descricao,
            preco: +body.preco,
            foto: (file as Express.MulterS3.File).location,
            chaveAws: (file as Express.MulterS3.File).key,
            barbeariaId: barbearia.id,
          },
        });

        return novoServico;
      }

    async editarServico(body: ServicoInterface, donoId: number, file: any) {

      const barbearia = await prisma.barbearia.findFirst({
        where: { usuarioId: donoId }
      });

      if(!barbearia)
        throw new QueryError('Barbearia não encontrada.');

      const servico = await prisma.servico.findFirst({
        where: { id: +body.id }
      });

      if(!servico)
        throw new QueryError('Serviço não encontrado.');

      if(servico.barbeariaId !== barbearia.id) {
          throw new NotAuthorizedError('Usuário não autorizado.');
      }

      const servicoExistente = await prisma.servico.findFirst({
        where: { nome: body.nome }
      });

      if(servicoExistente && servicoExistente.id !== +body.id)
        throw new QueryError('Serviço já existe.');

      if(file){
        deleteObject(servico?.chaveAws!);
        body.foto = (file as Express.MulterS3.File).location;
        body.chaveAws = (file as Express.MulterS3.File).key;
      }
      else{
        body.foto = servico?.foto;
        body.chaveAws = servico?.chaveAws;
      }

      const servicoAtualizado = await prisma.servico.update({
          where: { id: +body.id },
          data: {
              nome: body.nome,
              descricao: body.descricao,
              preco: +body.preco,
              foto: body.foto,
              chaveAws: body.chaveAws,
          }
      });

      return servicoAtualizado;
  }

    async deletarServico(servicoId: number, donoId: number) {
      const barbearia = await prisma.barbearia.findFirst({
        where: { usuarioId: donoId }
      });

      if(!barbearia)
        throw new QueryError('Barbearia não encontrada.');

      const servico = await prisma.servico.findFirst({
        where: { id: servicoId }
      });

      if(!servico)
        throw new QueryError('Serviço não encontrado.');

      if(servico.barbeariaId !== barbearia.id) {
          throw new NotAuthorizedError('Usuário não autorizado.');
      }

      const servicoDeletado = await prisma.servico.delete({
          where: { id: servicoId }
      });

      return servicoDeletado;
    }

    async listarServicosBarbearia(idBarbearia: number) {
      const servicos = await prisma.servico.findMany({
        where: { barbeariaId: idBarbearia }
      });

      return servicos;
    }
}

export default new servicoService();

