'use client';

import { AuthContext } from "@/app/_contexts/AuthContext";
import BarbershopInfo from "./_components/barbershop-info";
import ServiceItem from "./_components/service-item";

import { useContext, useEffect, useState } from "react";

import { Service, Barbershop } from "@/app/_services/types";
import { getBarbershop } from "@/app/_services/routes/barbershop";

interface BarbershopDetailPageProps {
    params: {
        id?: number;
    }
}


const BarbershopDetailPage = ({ params }: BarbershopDetailPageProps) => {

    const { isAuthenticated } =  useContext(AuthContext);

    if (!params.id) {

        return <h1>404</h1>
    };

    const [barbershop, setBarbershop] = useState<Barbershop | null>(null);

    useEffect(() => {
        const fetchBarbershops = async () => {
            try {
                const fetchedBarbershops = await getBarbershop(params.id!);
                setBarbershop(fetchedBarbershops);
            } catch (error) {
                console.error('Erro ao listar barbearias', error);
            }
        };

        fetchBarbershops();
    }, []);

    //TODO: Implementar loading
    if (!barbershop) {
        return <h1>Carregando...</h1>
    }

    return (  
       <div>
            <BarbershopInfo barbershop={barbershop!}/>

            <div className="flex flex-col gap-4 px-5 py-6">
                    {barbershop!.servicos.map((service :Service) => (
                        <ServiceItem key={service.id} service={service} barbershop={barbershop} isAutencticated={ isAuthenticated } />
                    ))}
            </div>
        </div>
    );
}

export default BarbershopDetailPage;