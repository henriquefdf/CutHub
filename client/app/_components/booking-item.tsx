import {Card, CardContent} from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

const BookingItem = () => {
    return (  
        <Card >
            <CardContent className="p-5 flex flex-row justify-between py-0">
                <div className="flex flex-col gap-2 py-5">
                    <Badge className="w-fit bg-[#221C3D] text-primary hover:bg-[#221C3D]">Confirmado</Badge>
                    <h2 className="font-bold">Corte de Cabelo</h2>

                    <div className="flex gap-2 items-center">
                        <Avatar className ="h-6 w-6">
                            <AvatarImage src="https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png"/>

                            <AvatarFallback>B</AvatarFallback>
                        </Avatar>

                        <h3 className="text-sm"> Vintage Barber</h3>
                    </div>

                </div>

                <div className="flex flex-col items-center justify-center px-3 border-l border-solid border-secondary">
                    <p className="text-sm">Fevereiro</p>
                    <p className="text-2xl">06</p>
                    <p className="text-sm">09:45</p>

                </div>
            </CardContent>
        </Card>

        );
}

export default BookingItem;