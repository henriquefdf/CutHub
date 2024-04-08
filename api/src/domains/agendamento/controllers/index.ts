import { Router, Request, Response, NextFunction } from 'express';
import { checkTipo, verifyJWT } from '../../../middlewares/auth';
import agendamentoService from '../services/agendamentoService';
import { usuarioTipo } from '../../usuario/constants/tipos';
import { codigoStatus } from '../../../../utils/constants/statusCodes';

const router = Router();

router.post('/criar',
    verifyJWT,
    checkTipo(usuarioTipo.CLIENTE),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const novoAgendamento = await agendamentoService.criarAgendamento(req.body, req.Usuario!.id);
            res.status(codigoStatus.CRIADO).json(novoAgendamento);
        } catch (error) {
            next(error);
        }
})

router.get('/listarDoCliente/:finalizado',
    verifyJWT,
    checkTipo(usuarioTipo.CLIENTE),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const agendamentos = await agendamentoService.listarAgendamentosCliente(req.Usuario!.id, req.params.finalizado);
            res.status(codigoStatus.SUCESSO).json(agendamentos);
        } catch (error) {
            next(error);
        }
})

router.get('/listarDaBarbearia',
    verifyJWT,
    checkTipo(usuarioTipo.DONO_BARBEARIA),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const agendamentos = await agendamentoService.listarAgendamentosBarbearia(req.Usuario!.id);
            res.status(codigoStatus.SUCESSO).json(agendamentos);
        } catch (error) {
            next(error);
        }
})

router.delete('/deletar/:id',
    verifyJWT,
    checkTipo(usuarioTipo.CLIENTE),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await agendamentoService.deletarAgendamento(+req.params.id, req.Usuario!.id);
            res.status(codigoStatus.SUCESSO).send();
        } catch (error) {
            next(error);
        }
})

router.get('/:barbeariaId/:data' ,
    verifyJWT,
    checkTipo(usuarioTipo.CLIENTE),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const agendamentos = await agendamentoService.listarAgendamentosBarbeariaData(req.params.barbeariaId, new Date(req.params.data));
            res.status(codigoStatus.SUCESSO).json(agendamentos);
        } catch (error) {
            next(error);
        }
})



export default router;