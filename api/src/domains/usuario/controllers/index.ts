import {Router, Request, Response, NextFunction} from 'express';
import { Usuario } from '@prisma/client';
import { loginMiddleware, logoutMiddleware, notLoggedIn, verifyJWT } from '../../../middlewares/auth';
import usuarioService from '../services/usuarioService';
import { codigoStatus } from '../../../../utils/constants/statusCodes';
import { upload } from '../../../../utils/functions/aws';
const router= Router();

router.post('/login', notLoggedIn, loginMiddleware);

router.post('/logout', verifyJWT, logoutMiddleware);

router.post('/enviaToken', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await usuarioService.createToken(req.body.email);
        res.status(codigoStatus.SUCESSO).json({ message: 'Email enviado com sucesso.' });
    } catch (error) {
        next(error);
    }
})

router.post('/validaToken', async (req: Request, res: Response, next: NextFunction) => {
        try {
            await usuarioService.validateToken(req.body.email, req.body.token, req.body.senha);
            res.json('Token validado corretamente!').status(codigoStatus.SUCESSO).end();
        } catch (error) {
            next(error);
        }
    });

router.post('/criar',  upload.single('foto'), async (req: Request, res: Response, next: NextFunction) => {
        try {
            const novoUsuario = await usuarioService.criar(req.body, req.file as Express.MulterS3.File);
            res.status(codigoStatus.CRIADO).json(novoUsuario);
        } catch (error) {
            next(error);
        }
})

router.get('/minhaconta', verifyJWT, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usuario = await usuarioService.getUsuario(req.Usuario?.id as number);
        res.status(codigoStatus.SUCESSO).json(usuario);
    } catch (error) {
        next(error);
    }
})

router.get('/lista', verifyJWT, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usuarios = await usuarioService.getListaUsuarios();
        res.status(codigoStatus.SUCESSO).json(usuarios);
    } catch (error) {
        next(error);
    }
})

router.put('/atualizar', verifyJWT,  upload.single('foto'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usuario = await usuarioService.updateUsuario(req.body, req.Usuario as Usuario, req?.file as Express.MulterS3.File);
        res.status(codigoStatus.SUCESSO).json(usuario);
    } catch (error) {
        next(error);
    }
})

router.delete('/deletar', verifyJWT, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await usuarioService.deleteUsuario(req.Usuario as Usuario);
        res.status(codigoStatus.SUCESSO).json({ message: 'Usuário deletado com sucesso.' });
    } catch (error) {
        next(error);
    }
})

export default router;
