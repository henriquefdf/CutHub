'use client';

import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { StarIcon } from "lucide-react";
import Image from "next/image";

import { useRouter } from "next/navigation";

import { Barbershop } from "@/app/_services/types";


interface BarbershopItemProps {
    barbershop: Barbershop;
}


const BarbershopItem = ({ barbershop }: BarbershopItemProps) => {

    const router = useRouter();
    const handleBookingClick = () => {
        router.push(`/barbershops/${barbershop.id}`);
    }

    return (
        <Card className="min-w-[167px] max-w-[167px] rounded-2xl">
            <CardContent className="px-1 py-0">
                <div className="w-full h-[159px] relative">

                    <div className="top-2 absolute left-2 z-50">
                        <Badge variant="secondary" className=" opacity-90 flex gap-1 items-center top-3 left-3" >
                            <StarIcon size={12} className="fill-primary text-primary" />
                            <span className="text-xs ">4,9</span>
                        </Badge>
                    </div>
                    <Image
                        alt={barbershop.nome}
                        src={barbershop.foto}
                        style={{
                            objectFit: "cover",
                        }}
                        fill
                        className=" rounded-2xl"
                    />


                </div>
                <div className="px-2 pb-3">
                    <h2 className="font-bold mt-2 overflow-hidden text-ellipsis text-nowrap">{barbershop.nome}</h2>
                    <p className="text-sm text-gray-400 overflow-hidden text-ellipsis text-nowrap">{barbershop.endereco}</p>
                    <Button
                        variant="secondary"
                        className="w-full mt-3"
                        onClick={handleBookingClick} >
                        Reservar
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}

export default BarbershopItem;