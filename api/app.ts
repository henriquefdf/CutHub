import UsuarioController from "./Usuario/controllers";

async function main() {
    const usuarioController = new UsuarioController();

    const usuario = await usuarioController.create({
        nome: "João",
        email: "teste@gmail.com",
    });

    console.log(usuario);
}

main()