import { api } from './api';

import { User } from '@/app/_services/types';

export async function createUser(data: FormData) {
  try {
    const response = await api.post('/usuarios/criar', data , {
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