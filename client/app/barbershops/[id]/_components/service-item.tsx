import { Button } from "@/app/_components/ui/button";
import { Calendar } from "@/app/_components/ui/calendar";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetHeader, SheetFooter } from "@/app/_components/ui/sheet";
import { useEffect, useMemo, useState, useContext } from "react";
import { AuthContext } from "@/app/_contexts/AuthContext";
import { Service, Booking, Barbershop } from "@/app/_services/types";
import { generateDayTimeList } from "../_helpers/hours";
import { ptBR } from "date-fns/locale/pt-BR";
import { format, setHours, setMinutes } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getDayBookings, createBooking } from "@/app/_services/routes/bookings";

interface ServiceItemProps {
    barbershop: Barbershop;
    service: Service
    isAutencticated: boolean
}

const ServiceItem = ({ service, isAutencticated, barbershop }: ServiceItemProps) => {

    const router = useRouter()
    const { user } = useContext(AuthContext)

    const [date, setDate] = useState<Date | undefined>(undefined)
    const [hour, setHour] = useState<string | undefined>()
    const [submitIsLoading, setSubmitIsLoading] = useState(false)
    const [sheetIsOpen, setSheetIsOpen] = useState(false)
    const [dayBookings, setDayBookings] = useState<Booking[]>([]);

    useEffect(() => {
        if (!date) {
            return;
        }
        //hook para atualizar a lista de horários disponíveis no dia
        const refreshAvailableHours = async () => {
            const __dayBookings = await getDayBookings(barbershop.id, date)

            setDayBookings(__dayBookings); //setar as datas ja cadastradas
        };

        refreshAvailableHours();
    }, [date, barbershop.id])


    const handleDateClick = (date: Date | undefined) => {
        setDate(date)
        setHour(undefined)
    }

    const handleHourClick = (time: string) => {
        setHour(time)
    }

    const handleBookingClick = () => {
        if (!isAutencticated) {
            router.push('/login')
        }
    }

    const handleBookingSubmit = async () => {
        setSubmitIsLoading(true);
        try {
            if (!date || !hour || !user) {
                return;
            }

            const dateHour = Number(hour.split(":")[0]);
            const dateMinutes = Number(hour.split(":")[1]);

            const newDate = setMinutes(setHours(date, dateHour), dateMinutes);

            await createBooking({
                data: newDate,
                servicoId: service.id,
                barbeariaId: barbershop.id,
                usuarioId: user.id,
            });

            setSheetIsOpen(false);
            setHour(undefined);
            setDate(undefined);

            toast("Reserva realizada com sucesso!", {
                description: format(newDate, " 'Para' dd 'de' MMM 'às' HH':'mm'.'", {
                    locale: ptBR
                }),
                action: {
                    label: "Visualizar",
                    onClick: () => {
                        router.push('/bookings');
                    },
                },
                style: {
                    backgroundColor: "#1c252d",
                    color: "#d4e1ea",
                    border: "none"
                },
            });


        } catch (error) {
            console.error(error);
        } finally {
            setSubmitIsLoading(false);
        }
    }

    //Só chama se a data mudar -> melhora a performance
    const timeList = useMemo(() => {
        if (!date) {
            return [];
        }

        return generateDayTimeList(date).filter((time: string) => {
            const dateHour = Number(time.split(":")[0]);
            const dateMinutes = Number(time.split(":")[1]);

            const booking = dayBookings.find((booking) => {
                const bookingHour = new Date(booking.data).getHours();
                const bookingMinutes = new Date(booking.data).getMinutes();

                return dateHour === bookingHour && dateMinutes === bookingMinutes
            });


            if (!booking) {
                return true;
            }

            return false;
        });
    }, [date, dayBookings]);

    return (
        <Card>
            <CardContent className="p-3">
                <div className="flex gap-4 items-center">

                    <div className="relative min-h-[110px] min-w-[110px] max-h-[110px] max-w-[110px]">
                        <Image src={service.foto}
                            alt={service.nome}
                            fill style={{ objectFit: "contain" }}
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
                                }).format(service.preco)}
                            </p>


                            <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="secondary" onClick={handleBookingClick}>
                                        Reservar
                                    </Button>

                                </SheetTrigger>

                                <SheetContent className="p-0 lg:max-w-screen-lg overflow-y-scroll max-h-screen">
                                    <SheetHeader className="text-left px-5 py-6 border-b border-solid border-secondary">
                                        <SheetTitle>Fazer Reserva</SheetTitle>
                                    </SheetHeader>

                                    <div className="py-6">

                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={handleDateClick}
                                            className="mt-6"
                                            locale={ptBR}
                                            fromDate={new Date()}
                                            styles={{
                                                head_cell: {
                                                    width: "100%",
                                                    textTransform: "capitalize"
                                                },
                                                cell: {
                                                    width: "100%",
                                                },
                                                button: {
                                                    width: "100%"
                                                },
                                                nav_button_previous: {
                                                    width: "32px",
                                                    height: "32px"
                                                },
                                                nav_button_next: {
                                                    width: "32px",
                                                    height: "32px"
                                                },
                                                caption: {
                                                    textTransform: "capitalize"
                                                }
                                            }}
                                        />
                                    </div>



                                    {date && (
                                        <div className="flex gap-3 overflow-auto [&::-webkit-scrollbar]:hidden py-6 px-5 border-t border-solid border-secondary">
                                            {timeList.map((time: string) => (
                                                <Button
                                                    key={time}
                                                    variant={
                                                        time === hour ? "default" : "outline"
                                                    }
                                                    className="rounded-full"
                                                    onClick={() => handleHourClick(time)}
                                                >
                                                    {time}
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="py-6 px-5 border-t border-solid border-secondary">
                                        <Card>
                                            <CardContent className="p-3 gap-3 flex flex-col">
                                                <div className="flex justify-between">
                                                    <h2 className="font-bold">{service.nome}</h2>
                                                    <h3 className="font-bold">
                                                        {Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(Number(service.preco))}
                                                    </h3>
                                                </div>

                                                {date && (
                                                    <div className="flex justify-between">
                                                        <h3 className="text-gray-400 text-sm">Data</h3>
                                                        <h4 className="text-sm">
                                                            {format(date, "dd 'de' MMMM", {
                                                                locale: ptBR
                                                            })}</h4>
                                                    </div>
                                                )}

                                                {hour && (
                                                    <div className="flex justify-between">
                                                        <h3 className="text-gray-400 text-sm">Data</h3>
                                                        <h4 className="text-sm">{hour}</h4>
                                                    </div>
                                                )}

                                                <div className="flex justify-between">
                                                    <h3 className="text-gray-400">Barbearia</h3>
                                                    <h4 className="text-sm">{barbershop.nome}</h4>
                                                </div>
                                            </CardContent>
                                        </Card>

                                    </div>
                                    <SheetFooter className="px-5">
                                        <Button
                                            disabled={(!date || !hour || submitIsLoading)}
                                            onClick={handleBookingSubmit}
                                        >
                                            {submitIsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Confirmar Reserva
                                        </Button>
                                    </SheetFooter>

                                </SheetContent>

                            </Sheet>
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}

export default ServiceItem;