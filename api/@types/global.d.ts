import {Usuario} from '@prisma/client'

declare module 'express' {
    interface Request {
        Usuario?: JwtPayload; // Defina a propriedade Usuario no tipo Request
    }
}