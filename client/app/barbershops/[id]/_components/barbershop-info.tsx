
"use client";

import { Button } from "@/app/_components/ui/button";
import { Barbershop } from "@/app/_services/types";
import { ChevronLeftIcon, MapPin, MenuIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";


interface BarbershopDetailPageProps {
   barbershop: Barbershop;
}

const BarbershopInfo = ({barbershop}: BarbershopDetailPageProps) => {
    const  router = useRouter();

    const handleBack = () => {
        router.replace('/');
    }
    return (  
        <div>
            <div className ="h-[250px] w-full relative">
                <Button onClick={handleBack} size="icon" variant="outline" className="absolute top-4 left-4 z-50">
                    <ChevronLeftIcon />
                </Button>

                <Button size="icon" variant="outline" className="absolute top-4 right-4 z-50">
                    <MenuIcon />
                </Button>

                <Image src = {barbershop.foto} alt={barbershop.nome} fill objectFit="cover" className="opacity-75"/>
            </div>
            <div className="px-5 pt-3 pb-6 border-b border-solid border-secondary">

                <div>
                    <h1 className="font-bold text-xl">{barbershop.nome}</h1>
                </div>

                <div className="gap-2 justify-start items-center flex flex-row mt-3">
                    <MapPin size={16} className="text-primary" />
                    <p className="text-sm">{barbershop.endereco}</p>

                </div>

                <div className="gap-2 justify-start items-center flex flex-row mt-2">

                    <StarIcon size={16} className="fill-primary text-primary" />
                    <p className="text-sm mt-1">5.0 (899 avaliações)</p>
                </div>
            </div>
        </div>
    );
}

export default BarbershopInfo;