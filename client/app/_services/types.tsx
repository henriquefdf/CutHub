export type User = {
  nome: string;
  email: string;
  foto: string;
  senha: string;
  id: number;
  tipo: string;
  bookings: Booking[];
};

export interface Barbershop {
  id: number;
  nome: string;
  endereco: string;
  foto: string;
  servicos: Service[];
  bookings: Booking[];
}

export interface Service {
  id: number
  nome: string;
  descricao: string;
  preco: number;
  foto: string;
  bookings: Booking[];
}

export interface Booking {
  id: number;
  data: Date;
  servicoId: number;
  barbeariaId: number;
  usuarioId: number;
}

export interface BookingWithRelations extends Booking {
  servico: Service;
  barbearia: Barbershop;
}
