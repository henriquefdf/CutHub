'use client';

import Header from "../_components/header";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useContext } from "react";
import { AuthContext } from "../_contexts/AuthContext";
import Search from "../_components/search";
import BookingItem from "../_components/booking-item";
import { Barbershop } from "../_services/types";
import BarbershopItem from "../_components/barbershop-item";


function Home() {
    const { user } = useContext(AuthContext);

    const barbershops: Barbershop[] = [
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

    return (
        <div>
            <Header />
            <div className="px-5 pt-5">
                <h2 className="text-xl">
                    {user ? (
                        <>
                            Olá, <span className="font-bold">{user.nome.split(" ")[0]}</span>!
                        </>
                    ) : (
                        "Olá! Agende seu corte hoje"
                    )}
                </h2>
                <p className="capitalize text-sm">
                    {format(new Date(), "EEEE',' dd 'de' MMMM", {
                        locale: ptBR,
                    })}
                </p>
            </div>

            <div className="px-5 mt-5">
                <Search />
            </div>

            <div className="mt-6 px-5">
                <h2 className="mb-3 text-xs uppercase text-gray-400 font-bold">Agendamentos</h2>
                <BookingItem />
            </div>

            <div className="mt-6">
                <h2 className='px-5 text-xs mb-3 uppercase text-gray-400 font-bold' > Recomendados</h2>

                <div className="flex px-5 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    {barbershops.map((barbershop: Barbershop) => (
                        <BarbershopItem key={barbershop.id} barbershop={barbershop} />
                    ))}
                </div>

            </div>

        </div>
    );
}

export default Home;

