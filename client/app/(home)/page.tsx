'use client';

import Header from "../_components/header";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useContext } from "react";
import { AuthContext } from "../_contexts/AuthContext";
import Search from "../_components/search";


function Home() {
    const { user } = useContext(AuthContext);
    return (
        <div>
            <Header />
            <div className="px-5 pt-5">
                <h2 className="text-xl">
                    {user ? (
                        <>
                            Olá, <span className="font-bold">{user.nome.split(" ")[0]}</span>!
                        </>
                    ) : (
                        "Olá! Agende seu corte hoje"
                    )}
                </h2>
                <p className="capitalize text-sm">
                    {format(new Date(), "EEEE',' dd 'de' MMMM", {
                        locale: ptBR,
                    })}
                </p>
            </div>

            <div className="px-5 mt-5">
                <Search />
            </div>

        </div>
    );
}

export default Home;

