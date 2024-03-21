import { Router, Request, Response, NextFunction } from 'express';
import { Barbearia } from '@prisma/client';
import { checkTipo, verifyJWT } from '../../../middlewares/auth';
import barbeariaService from '../services/barbeariaService';
import { usuarioTipo } from '../../usuario/constants/tipos';
import { codigoStatus } from '../../../../utils/constants/statusCodes';
import { upload } from '../../../../utils/functions/aws';

const router = Router();

router.post('/criar', 
    verifyJWT,
    checkTipo(usuarioTipo.DONO_BARBEARIA),
    upload.single('foto'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const novaBarbearia = await barbeariaService.criarBarbearia(req.body, req.Usuario!.id, req.file);
            res.status(codigoStatus.CRIADO).json(novaBarbearia);
        } catch (error) {
            next(error);
        }
})

router.put('/editar',
    verifyJWT,
    checkTipo(usuarioTipo.DONO_BARBEARIA),
    upload.single('foto'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const barbeariaAtualizada = await barbeariaService.editarBarbearia(req.body, req.Usuario!.id, req.file);
            res.status(codigoStatus.SUCESSO).json(barbeariaAtualizada);
        } catch (error) {
            next(error);
        }
})

export default router;