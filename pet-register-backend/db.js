require('dotenv').config(); // Carrega as configurações de segurança
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD, // A senha agora fica escondida!
  database: 'pet_register_db'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('🟢 Conectado ao banco de dados');
});

module.exports = connection;