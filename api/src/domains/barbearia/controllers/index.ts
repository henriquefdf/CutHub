import { Router, Request, Response, NextFunction } from 'express';
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

router.get('/listar',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const barbearias = await barbeariaService.listarBarbearias();
            res.status(codigoStatus.SUCESSO).json(barbearias);
        } catch (error) {
            next(error);
        }
})

router.get('/listar/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const barbearia = await barbeariaService.listarBarbearia(+req.params.id);
            res.status(codigoStatus.SUCESSO).json(barbearia);
        } catch (error) {
            next(error);
        }
})

router.get('/listarPorNome/:nome',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const barbearia = await barbeariaService.listarBarbeariasPorNome(req.params.nome);
            res.status(codigoStatus.SUCESSO).json(barbearia);
        } catch (error) {
            next(error);
        }
})

export default router;