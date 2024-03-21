"use client";

import { CalendarIcon, CircleUserRound, HomeIcon, LogInIcon, LogOutIcon, MenuIcon } from 'lucide-react';
import { Avatar, AvatarImage } from './ui/avatar';
import { SheetHeader, SheetTitle} from './ui/sheet';
import { Button } from './ui/button';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AuthContext } from '../_contexts/AuthContext';
import { useContext } from 'react';


import { logout } from '../_services/auth';


const SideMenu = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();

    const handleLogoutClick = () => {
        logout();

    }

    const handleLoginClick = () => {
        router.push('/login');
    }
    return (
        <>

            <SheetHeader className="text-left border-b border-solid border-secondary p-5">
                <SheetTitle> Menu </SheetTitle>
            </SheetHeader>

            {user ? (
                <div className="flex justify-between px-5 py-6 items-center">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={user?.foto?? ""} alt={user.nome ?? ""} />
                        </Avatar>

                        <h2 className="font-bold"> {user.nome} </h2>
                    </div>

                    <Button variant="secondary" size="icon">
                        <LogOutIcon size={18} onClick={handleLogoutClick} />
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col px-5 py-6 gap-3">
                    <div className="flex items-center gap-2">
                        <CircleUserRound size={32} className='text-[#4E525B]' />
                        <h2 className="">Olá, faça seu login!</h2>

                    </div>

                    <Button variant="secondary" className="w-full justify-start" onClick={handleLoginClick}>
                        <LogInIcon className="mr-2" size={18} />
                        Fazer Login
                    </Button>
                </div>
            )}

            <div className="flex flex-col gap-3 px-5">
                <Button variant="outline" className="justify-start" asChild>
                    <Link href="/">
                        <HomeIcon size={18} className="mr-2" />
                        Início
                    </Link>
                </Button>

                {user && (
                    <Button variant="outline" className="justify-start" asChild>
                        <Link href="/bookings">
                            <CalendarIcon size={18} className="mr-2" />
                            Agendamentos
                        </Link>
                    </Button>
                )}
            </div>

        </>
    );
}

export default SideMenu;