import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Service } from "@/app/_services/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ServiceItemProps {
    service: Service
    isAutencticated: boolean
}

const ServiceItem = ({ service, isAutencticated }:ServiceItemProps ) => {

    const router = useRouter()

    const handleBookingClick = () => {
        if(!isAutencticated) {
            router.push('/login')
        }
    }

    return ( 
        <Card>
            <CardContent className ="p-3">
                <div className="flex gap-4 items-center">

                    <div className = "relative min-h-[110px] min-w-[110px] max-h-[110px] max-w-[110px]">
                        <Image src={service.foto} 
                            alt={service.nome} 
                            fill style = {{ objectFit: "contain"}}
                            className="rounded-lg"

                        />
                    </div>
                    <div className="flex flex-col w-full">
                        <h2 className="font-bold">{service.nome}</h2>
                        <p className="text-sm text-gray-400">{service.descricao}</p>

                        <div className="flex justify-between items-center mt-3">
                            <p className="font-bold text-primary">
                                {Intl.NumberFormat('pt-BR', {
                                    style: 'currency', 
                                    currency: 'BRL'
                                    }).format(service.preco)}</p>
                            <Button variant="secondary" onClick={handleBookingClick}  >
                                Reservar
                            </Button>
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
     );
}

export default ServiceItem;