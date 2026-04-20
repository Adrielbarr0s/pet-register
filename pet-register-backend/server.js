const express = require('express');
const cors = require('cors');
const app = express();
const petsRoutes = require('./routes/pets');

app.use(cors());
app.use(express.json());

app.use('/api/pets', petsRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}/api/pets`);
});
