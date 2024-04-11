'use client';

import { redirect } from "next/navigation";
import BarbershopItem from "../_components/barbershop-item";
import Header from "../_components/header";
import { getBarbershopsByName } from "../_services/routes/barbershop";

interface BarbershopsPageProps {
    searchParams: {
        search?: string;
    }
}


const BarbershopsPage = async ({ searchParams }: BarbershopsPageProps) => {

    if(!searchParams.search){
        redirect("/")
    }

    const barbershops = await getBarbershopsByName(searchParams.search);

    return (
        <>
            <Header />

            <div className="px-5 py-6">
                <h1 className="text-gray-400 font-bold text-xs uppercase ">Resultados para &quot;{searchParams.search}&quot; </h1>

                <div className="grid grid-cols-2 mt-3 gap-4">
                    {barbershops.map((barbershop) => (
                        <BarbershopItem key={barbershop.id} barbershop={barbershop} />
                    ))}
                </div>
            </div>

        </>
    );
}

export default BarbershopsPage;