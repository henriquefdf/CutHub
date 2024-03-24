"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/app/_components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/app/_components/ui/form";

import { UserTypeDropdown } from "./userType-dropdown";

import { Input } from "@/app/_components/ui/input";
import { Image as ImageIcon } from "lucide-react";

import { createUser } from "@/app/_services/user";


const registerSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Tipo de email inválido"),
    foto: z.instanceof(File),
    senha: z.string().min(6, "Senha deve ser maior que 6"),
    tipo: z.enum(["cliente", "dono_barbearia"])
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export function RegisterForm() {

    const Router = useRouter();

    const form = useForm<RegisterFormInputs>({
        resolver: zodResolver(registerSchema),
        mode: 'onSubmit'
    });

    const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
        const formData = new FormData();

        formData.append("nome", data.nome);
        formData.append("email", data.email);
        formData.append("senha", data.senha);
        formData.append("tipo", data.tipo);

        if (data.foto) {
            formData.append("foto", data.foto);
        }

        try {
            await createUser(formData);
            Router.push("/login");
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col items-center gap-3">
                <Image src="/logo.png" alt="Logo" width={90} height={12} className="mb-4" />


                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem className="mb-2 w-full min-w-80">
                                    <FormLabel>Nome Completo</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite seu nome completo"
                                            {...field}
                                            className="p-2 w-full"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="mb-2 w-full min-w-md">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite seu email"
                                            {...field}
                                            className="p-2 w-full"
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
                                <FormItem className="mb-2 w-full min-w-md">
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Digite sua senha"
                                            {...field}
                                            className="p-2 w-full"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="foto"
                            render={({ field: { onChange, ref, value } }) => (
                                <FormItem className="mb-2 w-full min-w-">
                                    <FormLabel>Foto</FormLabel>
                                    <div className="flex items-center relative">
                                        <label
                                            htmlFor="file-upload"
                                            className={`flex justify-between h-10 items-center w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer focus-within:ring-2 focus-within:ring-ring ${value ? "text-primary-foreground" : "text-muted-foreground"
                                                }`}
                                        >
                                            <span>{value?.name || 'Foto de perfil'}</span>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                ref={ref}
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        onChange(e.target.files[0]);
                                                    }
                                                }}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                            <ImageIcon size={20} className="absolute right-3" />
                                        </label>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tipo"
                            render={({ field }) => (
                                <FormItem className="mb-4 w-full min-w-md">
                                    <FormLabel>Tipo de Usuário</FormLabel>
                                    <UserTypeDropdown field={field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <Button variant="default" type="submit" className="w-full mt-4">
                            Cadastro
                        </Button>

                    </form>
                </Form>
            </div>
        </div>
    );
}

