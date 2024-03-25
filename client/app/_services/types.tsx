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
  services: Service[];
  bookings: Booking[];
}

export interface Service {
  id: number
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  // bookings: Booking[];
}

export interface Booking {
  id: number;
  date: Date;
  service: Service;
  barbershop: Barbershop;
  user: User;
}

export const services: Service[] = [
  {
    id: 1,
    name: "Corte de Cabelo",
    description: "Estilo personalizado com as últimas tendências.",
    price: 60.0,
    imageUrl: "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
  },
  {
    id: 2,
    name: "Barba",
    description: "Modelagem completa para destacar sua masculinidade.",
    price: 40.0,
    imageUrl: "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
  },
  {
    id: 3,
    name: "Pézinho",
    description: "Acabamento perfeito para um visual renovado.",
    price: 35.0,
    imageUrl: "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
  },
  {
    id: 4,
    name: "Sobrancelha",
    description: "Expressão acentuada com modelagem precisa.",
    price: 20.0,
    imageUrl: "https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png",
  },
  {
    id: 5,
    name: "Massagem",
    description: "Relaxe com uma massagem revigorante.",
    price: 50.0,
    imageUrl: "https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png",
  },
  {
    id: 6,
    name: "Hidratação",
    description: "Hidratação profunda para cabelo e barba.",
    price: 25.0,
    imageUrl: "https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png",
  },
];





// bookings.forEach(booking => {
//   booking.service.bookings.push(booking);
//   booking.barbershop.bookings.push(booking);
//   booking.user.bookings.push(booking);
// })