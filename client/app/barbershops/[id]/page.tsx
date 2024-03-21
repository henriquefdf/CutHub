"use client";

import { AuthContext } from "@/app/_contexts/AuthContext";
import BarbershopInfo from "./_components/barbershop-info";
import ServiceItem from "./_components/service-item";

import { barbershops } from "@/app/_services/types";
import { Service } from "@/app/_services/types";
import { useContext } from "react";

interface BarbershopDetailPageProps {
    params: {
        id?: number;
    }
}


const BarbershopDetailPage = async ({ params }: BarbershopDetailPageProps) => {

    const { isAuthenticated } =  useContext(AuthContext);

    if (!params.id) {

        return <h1>404</h1>
    };

    const barbershop = barbershops.find(async (barbershop) => barbershop.id === params.id);


    return (  
       <div>
            <BarbershopInfo barbershop={barbershop!}/>

            <div className="flex flex-col gap-4 px-5 py-6">
                    {barbershop!.services.map((service :Service) => (
                        <ServiceItem key={service.id} service={service} isAutencticated={ isAuthenticated } />
                    ))}
            </div>
        </div>
    );
}

export default BarbershopDetailPage;