import { api } from '../api'
import { Barbershop } from '../types'


export async function listBarbershops() {
  try {
    const response = await api.get('/barbearias/listar')
    return response.data as Barbershop[]
  } catch (error) {
    throw new Error('Erro ao listar barbearias')
  }
}