export type User = {
  nome: string;
  email: string;
  foto: string;
  senha: string;
  id: string;
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
  name: string;
  descricao: string;
  preco: number;
  foto: string;
  bookings: Booking[];
}

export interface Booking {
  id: number;
  data: Date;
  servicos: Service;
  barbershop: Barbershop;
  usuario: User;
}
