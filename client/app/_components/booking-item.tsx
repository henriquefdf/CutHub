"use client";

import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { format, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import Image from "next/image";
import { Button } from "./ui/button";
import { cancelBooking } from  "../_services/routes/bookings";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { BookingWithRelations } from "../_services/types";
import { useRouter } from "next/navigation";
interface BookingItemProps {
    booking: BookingWithRelations;
}

const BookingItem = ({ booking }: BookingItemProps) => {

    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const router = useRouter();

    const handleCancelClick = async () => {
        setIsDeleteLoading(true);
        try {
            await cancelBooking(booking.id);

            toast.success("Reserva cancelada com sucesso");
            router.refresh();
            
        } catch (error) {
            console.log(error);
        } finally {
            setIsDeleteLoading(false);
        }
    }

    const isBookingConfirmed = isFuture(booking.data);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Card className="min-w-full" >
                    <CardContent className="p-5 pr-0 flex flex-row justify-between py-0">
                        <div className="flex flex-col gap-2 py-5">
                            <Badge
                                className="w-fit "
                                variant={isBookingConfirmed ? 'default' : 'secondary'}
                            >
                                {isBookingConfirmed ? "Confirmado" : "Finalizado"}
                            </Badge>
                            <h2 className="font-bold">{booking.servico.nome}</h2>

                            <div className="flex gap-2 items-center">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={booking.barbearia.foto} />

                                    <AvatarFallback>B</AvatarFallback>
                                </Avatar>

                                <h3 className="text-sm"> {booking.barbearia?.nome}</h3>
                            </div>

                        </div>

                        <div className="flex flex-col items-center justify-center px-8 py-3 border-l border-solid border-secondary">
                            <p className="text-sm capitalize">{format(booking.data, "MMMM", {
                                locale: ptBR,
                            })}
                            </p>
                            <p className="text-2xl">{format(booking.data, "dd")}</p>
                            <p className="text-sm">{format(booking.data, "kk:mm")}</p>

                        </div>
                    </CardContent>
                </Card>

            </SheetTrigger>

            <SheetContent className="px-0">
                <SheetHeader className="px-5 text-left pb-6 border-b border-solid border-secondary">
                    <SheetTitle>Informações da Reserva</SheetTitle>
                </SheetHeader>

                <div className="px-5">
                    <div className="relative h-[180px] w-full mt-6">
                        <Image src="/barbershop-map.png" fill alt={booking.barbearia.nome} />

                        <div className="w-full absolute bottom-4 left-0 px-5">
                            <Card>
                                <CardContent className="p-3 flex gap-2">
                                    <Avatar>
                                        <AvatarImage src={booking.barbearia.foto} />
                                        <AvatarFallback>B</AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col">
                                        <h2 className="font-bold">{booking.barbearia.nome}</h2>
                                        <h3 className="text-xs overflow-hidden text-ellipsis">{booking.barbearia.endereco}</h3>
                                    </div>

                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Badge
                        className="w-fit my-3"
                        variant={isBookingConfirmed ? 'default' : 'secondary'}
                    >
                        {isBookingConfirmed ? "Confirmado" : "Finalizado"}
                    </Badge>

                    <Card>
                        <CardContent className="p-3 gap-3 flex flex-col">
                            <div className="flex justify-between">
                                <h2 className="font-bold">{booking.servico.nome}</h2>
                                <h3 className="font-bold">
                                    {Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(Number(booking.servico.preco))}
                                </h3>
                            </div>

                            <div className="flex justify-between">
                                <h3 className="text-gray-400 text-sm">Data</h3>
                                <h4 className="text-sm">
                                    {format(booking.data, "dd 'de' MMMM", {
                                        locale: ptBR
                                    })}</h4>
                            </div>

                            <div className="flex justify-between">
                                <h3 className="text-gray-400 text-sm">Data</h3>
                                <h4 className="text-sm">{format(booking.data, "kk:mm", {
                                    locale: ptBR
                                })}</h4>
                            </div>

                            <div className="flex justify-between">
                                <h3 className="text-gray-400">Barbearia</h3>
                                <h4 className="text-sm">{booking.barbearia.nome}</h4>
                            </div>
                        </CardContent>
                    </Card>

                    <SheetFooter className="gap-3 flex-row mt-6">
                        <SheetClose asChild>
                            <Button className="w-full" variant="secondary">Voltar</Button>
                        </SheetClose>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    disabled={!isBookingConfirmed || isDeleteLoading}
                                    className="w-full"
                                    variant="destructive"
                                >
                                    {isDeleteLoading && (<Loader2 className="mr-2 h-4 w-4 animate-spin" />)}
                                    Cancelar Reserva
                                </Button>

                            </AlertDialogTrigger>
                            <AlertDialogContent className="w-[90%]">

                                <AlertDialogHeader>
                                    <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tem certeza que deseja cancelar esse agendamento?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter className="flex-row gap-3">
                                    <AlertDialogCancel className="w-full mt-0">Voltar</AlertDialogCancel>
                                    <AlertDialogAction disabled={isDeleteLoading} className="w-full" onClick={handleCancelClick}>Confirmar</AlertDialogAction>
                                </AlertDialogFooter>

                            </AlertDialogContent>
                        </AlertDialog>

                    </SheetFooter>

                </div>

            </SheetContent>

        </Sheet>

    );
}

export default BookingItem;