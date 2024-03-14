"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/_components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form"
import { Input } from "@/app/_components/ui/input"
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().min(2, { message: "Username must be at least 2 characters long." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm({}) {


  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    console.log(data);
    //TODO: CONECTAR COM O BACKEND
  };
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <Image src="/logo.png" alt="Logo" width={250} height={22} className="mb-5" />
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
              name="password"
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
            <Button variant="default" type="submit" className="w-full mt-4"> {/* Botão estilizado para ocupar a largura total */}
              Login
            </Button>


            <div className="text-center mt-3">
              <a href="/forgot-password" className="text-gray-400 text-sm">
                Esqueci minha senha
              </a>
            </div>

            {/* Divisão opcional */}
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
