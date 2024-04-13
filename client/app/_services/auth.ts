import { api } from './api';
import { User } from '@/app/_services/types';

export type SignInRequestData = {
  email: string;
  senha: string;
};

export async function signInRequest(data: SignInRequestData) {
  try {
    const response = await api.post('/usuarios/login', data);

    const { token } = response.data;
    return { token };
  } catch (error) {
    throw new Error(String('E-mail e/ou senha incorretos!'));
  }
}

export async function recoverUserInformation() {
  try {
    const response = await api.get('/usuarios/minhaconta');
    const  user:User  = response.data;
    return user;
  } catch (error) {
    throw new Error('Erro ao recuperar informações do usuário');
  }
}

export async function logout() {
  try {
    await api.post('/usuarios/logout');
  } catch (error) {
    throw new Error('Erro ao fazer logout');
  }
}
