export interface Barbershop {
    id: number;
    nome: string;
    endereco: string;
    imageUrl: string;
    services: Service[];
    // bookings: Booking[];
}

export interface Service {
    id:number
    name: string;
    description: string;
    price: number;
    imageUrl: string;
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


export const barbershops: Barbershop[] = [
    {
        id: 1,
        nome: "Barbearia do Zé",
        endereco: "Rua das Flores, 123",
        imageUrl: "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png",
        services:  [services[0], services[1], services[2], services[3], services[4], services[5]],
    },
    {
        id: 2,
        nome: "Barbearia do Celim",
        endereco: "Rua das Rosas, 456",
        imageUrl: "https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png",
        services:   [services[0], services[1], services[2], services[3], services[4], services[5]],
    },
    {
        id: 3,
        nome: "Barbearia do Zé",
        endereco: "Rua das Flores, 123",
        imageUrl: "https://utfs.io/f/60f24f5c-9ed3-40ba-8c92-0cd1dcd043f9-16w.png",
        services:  [services[0], services[1], services[2], services[3], services[4], services[5]],
    },
];


