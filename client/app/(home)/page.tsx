'use client';


import { useContext } from "react";
import { AuthContext } from "../_contexts/AuthContext";


import DadosUsuario from './dados-usuario';

function Home() {
    const { user } = useContext(AuthContext);
  return (
    <div>
      <h1>Home</h1>
      <DadosUsuario user={user} />
    </div>
  );
}
 
export default Home;

