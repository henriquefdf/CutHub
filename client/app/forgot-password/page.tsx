'use client';

import Image from "next/image";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/app/_components/ui/form"

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/app/_components/ui/input"

import { sendToken } from "../_services/user";

import { Button } from "@/app/_components/ui/button"

import { useRouter } from "next/navigation";
import { useToast } from "@/app/_components/ui/use-toast"


const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Tipo de email inválido" }),
});

type EmailFormInputs = z.infer<typeof forgotPasswordSchema>;


const ForgotPassword = () => {

    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<EmailFormInputs>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit: SubmitHandler<EmailFormInputs> = async (data) => {
        try {
            await sendToken(data.email);
            toast({
                variant: "default",
                title: "Token Enviado",
                description: "Token enviado para o email informado",
            });
            router.push('/token');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao Enviar Token",
                description: error.message || "Erro desconhecido",
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-8">
                <Image src="/logo.png" alt="Logo" width={130} height={130} />
            </div>
            <div className="w-full max-w-md px-6 py-8">
                <Form {...form}>
                    <h1 className="text-xl font-bold mb-4 text-center">Insira Email para recuperar sua senha</h1>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="mb-4 w-full">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Insira seu email"
                                            {...field}
                                            className='p-2 w-full'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button variant="default" type="submit" className="w-full mt-4">
                            Enviar
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default ForgotPassword;
