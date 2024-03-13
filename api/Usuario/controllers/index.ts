import { PrismaClient, Usuario } from "@prisma/client";

class UsuarioController {

    private prisma = new PrismaClient();

    constructor() {
        this.prisma = new PrismaClient();
    }
  
    async create(data: Omit<Usuario, 'id'>){
        try{
            return this.prisma.usuario.create({
                data: {
                    ...data
                }
            });
        }
        catch(e){
            throw e;
        }
    }
};

export default UsuarioController;