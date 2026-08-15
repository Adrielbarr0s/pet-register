import { db } from './db.js';

console.log('Populando banco de dados com registros...');

db.exec('DELETE FROM vacinas;');
db.exec('DELETE FROM pets;');
db.exec('DELETE FROM users;');
try {
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('pets', 'vacinas', 'users');");
} catch (e) {}

// Create a default user
const insertUser = db.prepare(`
  INSERT INTO users (google_id, email, nome, avatar)
  VALUES (?, ?, ?, ?)
`);
const userResult = insertUser.run('demo_google_id_123', 'demo@example.com', 'Usuário Demo', '');
const demoUserId = Number(userResult.lastInsertRowid);

const pets = [
  [demoUserId, 'Rex', 'Cachorro', 'Pastor Alemão', '2023-05-15', 3, 32.5, 'Adriel Barros', '(89) 99999-1111'],
  [demoUserId, 'Luna', 'Gato', 'Siamês', '2024-03-15', 2, 4.2, 'Karolaine Alencar', '(89) 99999-2222'],
  [demoUserId, 'Thor', 'Cachorro', 'Husky Siberiano', '2025-05-15', 1, 23.0, 'Carlos Eduardo', '(89) 99999-3333'],
  [demoUserId, 'Pipoca', 'Ave', 'Calopsita', '2026-03-15', 1, 0.1, 'Mariana Costa', '(89) 99999-4444'],
  [demoUserId, 'Mia', 'Gato', 'Persa', '2026-08-01', null, 0.8, 'Lucas Mendes', '(89) 99999-5555']
];

const insertPet = db.prepare(`
  INSERT INTO pets (user_id, nome, especie, raca, data_nascimento, idade, peso, tutor_nome, tutor_contato)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Armazena os IDs reais retornados na inserção
const petIds = pets.map(pet => Number(insertPet.run(...pet).lastInsertRowid));

const insertVacina = db.prepare(`
  INSERT INTO vacinas (pet_id, nome, data_aplicacao, proxima_dose)
  VALUES (?, ?, ?, ?)
`);

if (petIds[0]) {
  insertVacina.run(petIds[0], 'Antirrábica', '2026-01-10', '2027-01-10');
  insertVacina.run(petIds[0], 'V10', '2026-02-15', '2027-02-15');
}
if (petIds[1]) {
  insertVacina.run(petIds[1], 'Quádrupla Felina', '2026-03-01', '2027-03-01');
}

console.log('Seed concluído com sucesso!');
