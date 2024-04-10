import { api } from '../api';
import { Booking, BookingWithRelations } from '../types';

type BookingRequest = Omit <Booking, 'id'>; 

export async function getDayBookings(BarbershopId: number, date: Date) {
    try {
        const response = await api.get(`/agendamentos/${BarbershopId}/${date}`);
        return response.data as Booking[];
    } catch (error) {
        throw new Error('Erro ao buscar agendamentos');
    }
    
}

export async function createBooking(booking: BookingRequest) {
    try {
        const response = await api.post<BookingRequest>('/agendamentos/criar', booking);
        return response.data as Booking;
    } catch (error) {
        throw new Error('Erro ao criar agendamento');
    }
}

export async function cancelBooking(bookingId: number) {
    try {
        await api.delete(`/agendamentos/deletar/${bookingId}`);
    } catch (error) {
        throw new Error('Erro ao cancelar agendamento');
    }
}

export async function clientBookings(finalizado: number) {
    try {
        const response = await api.get(`/agendamentos/listarDoCliente/${finalizado}`);
        return response.data as BookingWithRelations[];
    } catch (error) {
        throw new Error('Erro ao confirmar agendamento');
    }
}