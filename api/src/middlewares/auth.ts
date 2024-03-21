/*eslint-disable*/
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { InvalidParamError } from '../../errors/InvalidParamError';
import { TokenError } from '../../errors/TokenError';
import { Usuario } from '@prisma/client';
import prisma from '../../config/prismaClient';
import { getEnv } from '../../utils/functions/getEnv';
import { loginError } from '../../errors/loginError';


declare module 'express' {
    interface Request {
        Usuario?: JwtPayload;
    }
}

function generateJWT(Usuario: Usuario, res: Response) {
    const body = {
        id: Usuario.id,
        email: Usuario.email,
        tipo: Usuario.tipo,
        nome: Usuario.nome,
    };

    const token = sign({ Usuario: body }, getEnv('SECRET_KEY') || '', { expiresIn: getEnv('JWT_EXPIRATION') });

    res.cookie('jwt', token);
    
    return token;
}

function cookieExtractor(req: Request) {
    return (req && req.cookies)? req.cookies['jwt']: null;
}

export async function loginMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const Usuario = await prisma.usuario.findFirst({ where: {email: req.body.email}});
        
        if (Usuario == null) {
            throw new InvalidParamError('E-mail e/ou senha incorretos!');
        }
        const matchingPassword = await compare(req.body.senha, Usuario.senha);

        if (!matchingPassword) {
            throw new InvalidParamError('E-mail e/ou senha incorretos!');
        }

        const token = generateJWT(Usuario, res);

        res.status(200).send({ token })
    } catch (error) {
        next(error);
    }
}

export async function logoutMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		const token = cookieExtractor(req);
		if(!token){
			throw new TokenError('Você não está logado no sistema!');
		}
        res.clearCookie('jwt');
		res.status(200).json('Logout realizado com sucesso!');
	}
	catch (err) {
		next(err);
	}
}

export function notLoggedIn(req: Request, res: Response, next: NextFunction) {
    try {
        const token = cookieExtractor(req);

        if (token) {
            const decoded = verify(token, getEnv('SECRET_KEY') || '');
            if (decoded) {
                throw new loginError('Você já está logado no sistema!');
            }
        }
        next();
    } catch (error) {
        next(error);
    }
}

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
    try {
        const token = cookieExtractor(req);
        if (token) {
            const decoded = verify(token, process.env.SECRET_KEY || '') as JwtPayload;
            req.Usuario = decoded.Usuario;
        }
        if (req.Usuario == null) {
            throw new TokenError('Você precisa estar logado para realizar essa ação!');
        }
        next();
    } catch (error) {
        next(error);
    }
}

export const checkTipo = (tipos: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try{
            !tipos.includes(req.Usuario?.tipo) ? res.status(401).json('Você não tem permissão para realizar essa ação!') : next();
        }
        catch(error){
            next(error);
        }
    };
};