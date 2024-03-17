import {Router, Request, Response, NextFunction} from 'express';
import { Usuario } from '@prisma/client';
import { loginMiddleware, logoutMiddleware, notLoggedIn, verifyJWT } from '../../../middlewares/auth';
import usuarioService from '../services/usuarioService';
const router= Router();

router.post('/login', notLoggedIn, loginMiddleware);

router.post('/logout', verifyJWT, logoutMiddleware);

router.post('/criar', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const novoUsuario = await usuarioService.criar(req.body);
        res.status(201).json(novoUsuario);
    } catch (error) {
        next(error);
    }
})


router.get('/minhaconta/:id', verifyJWT, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usuario = await usuarioService.getUsuario(req.params.id);
        res.status(200).json(usuario);
    } catch (error) {
        next(error);
    }
})

router.get('/lista', verifyJWT, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usuarios = await usuarioService.getListaUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        next(error);
    }
})

export default router;
