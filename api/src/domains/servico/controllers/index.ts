import { Router, Request, Response, NextFunction } from 'express';
import { checkTipo, verifyJWT } from '../../../middlewares/auth';
import servicoService from '../services/servicoService';
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
            const novoServico = await servicoService.criarServico(req.body, req.Usuario!.id, req.file);
            res.status(codigoStatus.CRIADO).json(novoServico);
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
            const servicoAtualizado = await servicoService.editarServico(req.body, req.Usuario!.id, req.file);
            res.status(codigoStatus.SUCESSO).json(servicoAtualizado);
        } catch (error) {
            next(error);
        }
})

router.delete('/deletar/:id',
    verifyJWT,
    checkTipo(usuarioTipo.DONO_BARBEARIA),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await servicoService.deletarServico(+req.params.id, req.Usuario!.id);
            res.status(codigoStatus.SUCESSO).json({ message: 'Serviço deletado com sucesso.' });
        } catch (error) {
            next(error);
        }
})

router.get('/listar/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const servicos = await servicoService.listarServicosBarbearia(+req.params.id);
            res.status(codigoStatus.SUCESSO).json(servicos);
        } catch (error) {
            next(error);
        }
})

export default router;