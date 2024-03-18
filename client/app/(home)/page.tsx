'use client';

import Header from "../_components/header";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useContext } from "react";
import { AuthContext } from "../_contexts/AuthContext";


function Home() {
    const { user } = useContext(AuthContext);
    return (
        <div>
            <Header />
            <div className="px-5 pt-5">
                <h2 className="text-xl font-bold">
                    {user ? `Olá, ${user.nome.split(" ")[0]}!` : "Olá! Vamos agendar um corte hoje?"}
                </h2>
                <p className="capitalize text-sm">
                    {format(new Date(), "EEEE',' dd 'de' MMMM", {
                        locale: ptBR,
                    })}
                </p>
            </div>
        </div>
    );
}

export default Home;

