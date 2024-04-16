'use client';

import Header from "../_components/header";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../_contexts/AuthContext";
import Search from "../_components/search";
import BookingItem from "../_components/booking-item";
import { Barbershop, BookingWithRelations } from "../_services/types";
import BarbershopItem from "../_components/barbershop-item";

import { listBarbershops } from "../_services/routes/barbershop";
import { clientBookings } from "../_services/routes/bookings";


function Home() {
    const { user } = useContext(AuthContext);

    const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
    const [bookings, setBookings] = useState<BookingWithRelations[]>([]);

    useEffect(() => {
        const fetchBarbershops = async () => {
            try {
                const fetchedBarbershops = await listBarbershops();
                setBarbershops(fetchedBarbershops);
            } catch (error) {
                console.error('Erro ao listar barbearias', error);
            }
        };

        fetchBarbershops();
    }, []);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const fetchedBookings = await clientBookings(0);
                setBookings(fetchedBookings);
            } catch (error) {
                console.error('Erro ao listar agendamentos', error);
            }
        };

        fetchBookings();
    }, []);

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

            <div className="mt-6">
                {bookings.length > 0 && (
                    <>

                        <h2 className="pl-5 mb-3 text-xs uppercase text-gray-400 font-bold">Agendamentos</h2>

                        <div className="px-5 flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">

                            {bookings.map((booking) => (
                                <BookingItem key={booking.id} booking={booking} />
                            ))}

                        </div>
                    </>
                )}
            </div>


            <div className="mt-6">
                <h2 className='px-5 text-xs mb-3 uppercase text-gray-400 font-bold' > Recomendados</h2>

                <div className="flex px-5 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    {barbershops.map((barbershop: Barbershop) => (
                        <BarbershopItem key={barbershop.id} barbershop={barbershop} />
                    ))}
                </div>

            </div>

            <div className="mt-6 mb-[4.5rem]">
                <h2 className='px-5 text-xs mb-3 uppercase text-gray-400 font-bold' > Populares </h2>

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