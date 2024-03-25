import { api } from '../api'
import { Service } from '../types'

export async function listServices(id: number) {
  try {
    const response = await api.get('/services/listar', { params: { id } })
    return response.data as Service[]
  } catch (error) {
    throw new Error('Erro ao listar serviços')
  }
}