/* eslint-disable @typescript-eslint/no-var-requires */

const { hash } = require('bcrypt');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://randomuser.me/api/?results=300'; // Altere o número de resultados conforme necessário
const now = new Date();
const folderName = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}_populando_banco`;
const FILE_PATH = path.join(folderName, 'migration.sql');

async function fetchRandomUsers() {
  try {
    const response = await axios.get(API_URL);
    return response.data.results;
  } catch (error) {
    console.error('Erro ao buscar os usuários aleatórios:', error);
    return [];
  }
}

async function encryptPassword(password) {
  const saltRounds = 10;
  return hash(password, saltRounds);
}

async function generateMigrationScript(users) {
  let idCounter = 1; // Começar em 1

  const migrationScript = await Promise.all(users.map(async (user) => {
    const { name, email, login, picture } = user;
    const tipo = Math.random() < 0.5 ? 'cliente' : 'barbeiro'; 
    const senha = await encryptPassword(login.password);
    const foto = picture.thumbnail;

    const currentId = idCounter++;

    return `INSERT INTO Usuario (id, nome, email, tipo, senha, foto) VALUES (${currentId}, '${name.first} ${name.last}', '${email}', '${tipo}', '${senha}', '${foto}');`;
  }));

  return migrationScript.join('\n');
}

async function main() {
  const randomUsers = await fetchRandomUsers();
  const migrationScript = await generateMigrationScript(randomUsers);

  fs.mkdirSync(folderName); 
  fs.writeFileSync(FILE_PATH, migrationScript);

  console.log(`Migration gerada e escrita em ${path.resolve(FILE_PATH)}`);
}

main();
