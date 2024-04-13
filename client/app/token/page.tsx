'use client';

import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InputOTP, InputOTPGroup, InputOTPSlot} from "@/app/_components/ui/input-otp"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/_components/ui/form"
import { Input } from "@/app/_components/ui/input"
import { Button } from "@/app/_components/ui/button"
import { validateToken } from "../_services/user";

import { useRouter } from "next/navigation";
import { useToast } from "@/app/_components/ui/use-toast"

const tokenPasswordSchema = z.object({
    senha: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
    token: z.string().min(6, { message: "Token deve ter no mínimo 6 caracteres" }),
    email: z.string().email({ message: "Tipo de email inválido" }),
});

type TokenFormInputs = z.infer<typeof tokenPasswordSchema>;

const Token = () => {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<TokenFormInputs>({
        resolver: zodResolver(tokenPasswordSchema),
        mode: 'onChange',
    });

    const onSubmit: SubmitHandler<TokenFormInputs> = async (data) => {
        try {
            await validateToken(data.email, data.token, data.senha);
            toast({
                variant: "default",
                title: "Senha Alterada com Sucesso",
                description: "Sua senha foi alterada com sucesso, você será redirecionado para a página de login",
            });
            router.push('/login');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao Alterar Senha",
                description: error.message || "Erro desconhecido",
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-8">
                <Image src="/logo.png" alt="Logo" width={130} height={130} />
            </div>
            <div className="w-full max-w-md px-6 py-8 mt-10">
                <Form {...form}>
                    <h1 className="text-xl font-bold mb-4 text-center">Recuperação de Senha</h1>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Insira seu email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="token"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Token</FormLabel>
                                    <FormControl>
                                        <InputOTP maxLength={6}
                                            pattern={'^[a-zA-Z0-9]+$'}{...field}>
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="senha"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nova Senha</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Insira sua nova senha"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button variant="default" type="submit" className="w-full">
                            Alterar Senha
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default Token;
