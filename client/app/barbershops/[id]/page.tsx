import { Button } from "@/app/_components/ui/button";
import { ChevronLeftIcon, MapPin, MenuIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import BarbershopInfo from "./_components/barbershop-info";

import { barbershops } from "@/app/_services/types"; 

interface BarbershopDetailPageProps {
    params:{
        id?: number;
    }
}


const BarbershopDetailPage  = async ({params}: BarbershopDetailPageProps) => {

    if(!params.id) {

        return <h1>404</h1>
    };

    const barbershop = barbershops.find(async(barbershop) => barbershop.id === params.id);


    return (  
       <BarbershopInfo barbershop={barbershop!}/>
    );
}

export default BarbershopDetailPage ;