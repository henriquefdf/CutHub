export interface Barbershop {
    id: number;
    nome: string;
    endereco: string;
    imageUrl: string;
    services: string[];
    // bookings: Booking[];
}

export const barbershops: Barbershop[] = [
    {
        id: 1,
        nome: "Barbearia do Zé",
        endereco: "Rua das Flores, 123",
        imageUrl: "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png",
        services: ["Corte", "Barba", "Pacote completo"],
    },
    {
        id: 2,
        nome: "Barbearia do Celim",
        endereco: "Rua das Rosas, 456",
        imageUrl: "https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png",
        services: ["Corte", "Barba", "Pacote completo"],
    },
    {
        id: 3,
        nome: "Barbearia do Zé",
        endereco: "Rua das Flores, 123",
        imageUrl: "https://utfs.io/f/60f24f5c-9ed3-40ba-8c92-0cd1dcd043f9-16w.png",
        services: ["Corte", "Barba", "Pacote completo"],
    },
];