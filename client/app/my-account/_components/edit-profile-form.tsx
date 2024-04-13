"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useContext } from "react";
import { AuthContext } from "../../_contexts/AuthContext";

import { Button } from "@/app/_components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/app/_components/ui/form";

import { Input } from "@/app/_components/ui/input";

import { updateUser } from "@/app/_services/user";
import { useToast } from "@/app/_components/ui/use-toast"

const editProfileSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório").optional(),
    email: z.string().email("Tipo de email inválido").optional(),
    foto: z.instanceof(File).optional(),
    senha: z.string().min(6, "Senha deve ser maior que 6").optional(),
    tipo: z.enum(["cliente", "dono_barbearia"]).optional(),
});

type EditProfileFormInputs = z.infer<typeof editProfileSchema>;

export function EditProfileForm() {

    const { user, updateUserContext} = useContext(AuthContext);
    const router = useRouter();
    const { toast } = useToast();
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const form = useForm<EditProfileFormInputs>({
        resolver: zodResolver(editProfileSchema),
        mode: 'onSubmit',
        defaultValues: {
            nome: user?.nome,
            email: user?.email,
        }
    })

    useEffect(() => {
        if (user?.foto) {
            setSelectedFile(user.foto);
        }
    }, [user]);

    if (!user) {
        return <div>Carregando informações do usuário...</div>;
    }

    const onSubmit: SubmitHandler<EditProfileFormInputs> = async (data) => {
        const formData = new FormData();
        if(data.nome) { formData.append("nome", data.nome)}
        if(data.email) { formData.append("email", data.email)}
        if(data.senha) { formData.append("senha", data.senha) }
        if (data.foto) {formData.append("foto", data.foto);}
        formData.append("tipo", user!.tipo);

        try {
            const update = await updateUser(formData);
            updateUserContext(update);
            toast({
                variant: "default",
                title: "Perfil Atualizado",
                description: "Seu perfil foi atualizado com sucesso",
            });
            router.push("/");
        } catch (error:any) {
            toast({
                variant: "destructive",
                title: "Erro ao Atualizar Perfil",
                description: error.message || "Erro desconhecido",
            });
        }
    };



    return (
        <div className="flex justify-center items-center mt-2">
            <div className="flex flex-col items-center gap-3">
                <label htmlFor="file-upload" className="cursor-pointer mb-4">
                    {selectedFile ? (
                        <Image src={selectedFile} alt="Foto de perfil" width={120} height={120} style={{
                            borderRadius: '60%',
                            border: '1px solid #1c252d',
                            overflow: 'hidden',
                          }}/>
                    ) : (
                        <div>Foto de perfil</div>
                    )}
                </label>
                <input
                    id="file-upload"
                    type="file"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            setSelectedFile(URL.createObjectURL(e.target.files[0]));
                            form.setValue('foto', e.target.files[0]);
                        }
                    }}
                    className="hidden"
                    accept="image/*"
                />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem className="mb-2 w-full">
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
                                <FormItem className="mb-2 w-full">
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
                                <FormItem className="mb-2 w-full">
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

                        <FormItem className="mb-4 w-full">
                            <FormLabel>Tipo de Usuário</FormLabel>
                            <Input
                                type="text"
                                defaultValue={user!.tipo}
                                className="p-2 w-full"
                                readOnly
                            />
                            <FormMessage />
                        </FormItem>

                        <Button variant="default" type="submit" className="w-full mt-4">
                            Salvar Alterações
                        </Button>

                    </form>
                </Form>
            </div>
        </div>
    );
}

