import { api } from './api';

import { User } from '@/app/_services/types';

export async function createUser(data: FormData) {
  try {
    const response = await api.post('/usuarios/criar', data, {
      headers: {
        Accept: "*/*",
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro ao criar usuário');
  }
}

export async function updateUser(data: FormData) {
  try {
    const response = await api.put('/usuarios/atualizar', data, {
      headers: {
        Accept: "*/*",
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro ao atualizar usuário');
  }
}

export async function sendToken(email: string) {
  try {
    const response = await api.post('/usuarios/enviaToken', { email });
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error('E-mail para recuperação de senha inválido.');
  }
}

export async function validateToken(email: string, token: string, senha: string) {
  try {
    const response = await api.post('/usuarios/validaToken', { email, token, senha });
    return response.data;
  } catch (error) {
    throw new Error('Token Inválido, verifique seus dados e tente novamente');
  }
}