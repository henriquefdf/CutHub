'use client';

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../_contexts/AuthContext";
import Header from "../_components/header";
import { redirect } from "next/navigation";
import BookingItem from "../_components/booking-item";
import { BookingWithRelations } from "../_services/types";
import { clientBookings } from "../_services/routes/bookings";

const BookingPage = () => {

    const user = useContext(AuthContext);
    const [confirmedBookings, setConfirmedBookings] = useState<BookingWithRelations[]>([]);
    const [finishedBookings, setFinishedBookings] = useState<BookingWithRelations[]>([]);

    useEffect(() => {
        if (!user) {
            redirect('/login');
        }

        const fetchBookings = async () => {
            const confirmed = await clientBookings(0);
            const finished = await clientBookings(1);
            setConfirmedBookings(confirmed);
            setFinishedBookings(finished);
        };

        fetchBookings();
    }, [user]);

    return (
        <>
            <Header />
            <div className="px-5 py-6">
                <h1 className="text-xl font-bold mb-6">Agendamentos</h1>

                {confirmedBookings.length === 0 && finishedBookings.length === 0 && (
                    <>
                    <p className="text-gray-400">Você não possui agendamentos</p>
                    </>
                )}

                {confirmedBookings.length > 0 && (
                    <>
                        <h2 className="text-gray-400 uppercase font-bold text-sm mb-3">Confirmados</h2>

                        <div className="flex-col flex gap-3">
                            {confirmedBookings.map((booking) => (
                                <BookingItem booking={booking} key={booking.id} />
                            ))}
                        </div>
                    </>
                )}

                {finishedBookings.length > 0 && (
                    <>
                        <h2 className="text-gray-400 uppercase font-bold text-sm mt-6 mb-3">Finalizados</h2>

                        <div className="flex-col flex gap-3">
                            {finishedBookings.map((booking) => (
                                <BookingItem booking={booking} key={booking.id} />
                            ))}
                        </div>
                    </>
                )
                }

            </div>
        </>
    );
}

export default BookingPage;