"use client";

import { createContext, ReactNode, useState, useEffect} from "react";
import { parseCookies } from 'nookies';
import { useRouter } from "next/navigation";

import { signInRequest, recoverUserInformation} from "@/app/_services/auth";
import { updateApiToken } from "@/app/_services/api";

import { User } from "@/app/_services/types";
import { SignInRequestData as SignInData } from "@/app/_services/auth";

type AuthProviderProps = {
    children: ReactNode;
};



type AuthContextType = {
    isAuthenticated: boolean;
    user: User | null;
    signIn: (data: SignInData) => Promise<void>;
    updateUserContext: (newUserData: User | null) => void;
};


export const AuthContext = createContext({} as AuthContextType);

const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter();

    const isAuthenticated = !!user;


    useEffect(() => {
        async function fetchUserData() {
          try {
            const { 'jwt': token } = parseCookies();

            if (token) {
              const userData = await recoverUserInformation(); 
                
              setUser(userData);
            }
          } catch (error) {
            console.error("Não foi possível recuperar as informações do usuário", error);
          }
        }
      
        fetchUserData();
      }, []);


    async function signIn({ email, senha }: SignInData) {
      try {
        const { token } = await signInRequest({ email, senha});

        updateApiToken(token);

        const userLogado: User  = await recoverUserInformation();
        setUser(userLogado);
        router.push('/');
      } catch (error) {
        throw new Error(String(error));
      }
    }

    async function updateUserContext (newUserData: User | null) {
      setUser(newUserData);
    };


    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signIn, updateUserContext }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;