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

export async function getBarbershop(id: number) {
  try {
    const response = await api.get(`/barbearias/listar/${id}`)
    return response.data as Barbershop
  } catch (error) {
    throw new Error('Erro ao buscar barbearia')
  }
}

export async function getBarbershopsByName(name: string) {
  try {
    const response = await api.get(`/barbearias/listarPorNome/${name}`)
    return response.data as Barbershop[]
  } catch (error) {
    throw new Error('Erro ao buscar barbearia')
  }
}