// Componente DadosUsuario.js ou DadosUsuario.tsx se estiver usando TypeScript

const DadosUsuario = ({ user }: any ) => {
    return ( 
        <div>
            <h2>Dados do usuário</h2>
            <p>Nome: {user?.nome}</p>
            <p>Email: {user?.email}</p>
            <p>Tipo: {user?.tipo} </p>
        </div>
     );
}
 
export default DadosUsuario;
  