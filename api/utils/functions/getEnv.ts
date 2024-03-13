export function getEnv(nome: string): any {
    const valor = process.env[nome];
    
    if (!valor) {
        throw new Error(`Faltando: process.env['${nome}'].`);
    }
    
    return valor;
}