"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useContext } from "react";
import { AuthContext } from "@/app/_contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/_components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form"
import { Input } from "@/app/_components/ui/input"
import Image from "next/image";

import { useToast } from "@/app/_components/ui/use-toast"

const loginSchema = z.object({
  email: z.string().email({ message: "Tipo de email inválido" }),
  senha: z.string().min(6, { message: "Senha deve ser maior que 6" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { signIn } = useContext(AuthContext);
  const { toast } = useToast();  

  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      await signIn(data);
    } catch (error:any) {
      toast({
        variant: "destructive",
        title: "Erro ao Entrar",
        description: error.message || "Erro desconhecido",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <Image src="/logo.png" alt="Logo" width={180} height={22} className="mb-5" />
        <Form {...form}>
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
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem className="mb-4 w-full">
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Insira sua senha"
                      {...field}
                      className='p-2 w-full'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button variant="default" type="submit" className="w-full mt-4"> 
              Login
            </Button>


            <div className="text-center mt-3">
              <a href="/forgot-password" className="text-gray-400 text-sm">
                Esqueci minha senha
              </a>
            </div>

            <div className="my-4">
              <hr className="border-t border-muted" />
            </div>

            <div className="text-center">
              <span className="text-muted-foreground text-sm">
                Não possui cadastro?
              </span>
              {' '}
              <a href="/register" className="text-primary-foreground text-sm font-medium">
                Cadastre-se agora
              </a>
            </div>


          </form>
        </Form>
      </div>
    </div>
  );
}
