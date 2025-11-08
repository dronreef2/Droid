#!/usr/bin/env node

console.log('Bem-vindo ao Simulador de Panqueca Fofa!');
console.log('Vamos simular o processo de fazer panquecas fofas.');

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function simulate() {
  console.log('\nPasso 1: Preparar os ingredientes.');
  const ingredients = await ask('Quais ingredientes você tem? (farinha, ovos, leite, etc.): ');
  console.log(`Você tem: ${ingredients}`);

  console.log('\nPasso 2: Misturar.');
  const mix = await ask('Como você vai misturar? (batedeira, fouet, mão): ');
  console.log(`Misturando com ${mix}...`);

  console.log('\nPasso 3: Cozinhar.');
  const cook = await ask('Em que temperatura? (baixa, média, alta): ');
  console.log(`Cozinhando em temperatura ${cook}...`);

  console.log('\nPasso 4: Servir.');
  const serve = await ask('Como servir? (com calda, frutas, puro): ');
  console.log(`Servindo ${serve}...`);

  console.log('\nSua panqueca fofa está pronta! Aproveite!');
  rl.close();
}

simulate();