import { test, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../src/server.js';
import { db } from '../src/config/db.js';
import jwt from 'jsonwebtoken';

let server;
let baseUrl;
let token;
let authHeaders;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}/api/pets`;
      resolve();
    });
  });

  const JWT_SECRET = process.env.JWT_SECRET || 'secret_para_desenvolvimento_nao_use_em_prod';
  token = jwt.sign({ id: 1, email: 'test@example.com', name: 'Test User' }, JWT_SECRET);
  authHeaders = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
});

after(() => {
  server.close();
});

test('Pets API Integration Tests', async (t) => {
  let createdPetId;

  await t.test('POST /api/pets - Sucesso ao criar um pet', async () => {
    const payload = {
      nome: 'Bolinha',
      especie: 'Cachorro',
      raca: 'Poodle',
      data_nascimento: '2023-01-15',
      idade: 2,
      peso: 5.5,
      tutor_nome: 'João Silva',
      tutor_contato: '(11) 98765-4321'
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 201, 'Status code deve ser 201');
    const data = await res.json();
    assert.ok(data.id, 'Deve retornar o ID do pet criado');
    assert.strictEqual(data.nome, 'Bolinha', 'Nome deve ser Bolinha');
    assert.strictEqual(data.data_nascimento, '2023-01-15', 'Deve retornar a data de nascimento');
    
    createdPetId = data.id; // Guarda para usar nos próximos testes
  });

  await t.test('POST /api/pets - Erro de validação Zod (campos obrigatórios)', async () => {
    const payload = {
      nome: 'B', // Nome muito curto, deve falhar
      especie: 'Cachorro'
      // Faltam tutor_nome e tutor_contato
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 400, 'Status code deve ser 400');
    const data = await res.json();
    assert.strictEqual(data.error, 'Erro de validação');
    assert.ok(Array.isArray(data.details), 'Detalhes do erro devem ser um array');
  });

  await t.test('GET /api/pets - Paginação e listagem', async () => {
    // Insere mais um pet para garantir listagem
    await fetch(baseUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        nome: 'Frajola',
        especie: 'Gato',
        tutor_nome: 'Maria Silva',
        tutor_contato: '(11) 91111-2222'
      })
    });

    const res = await fetch(`${baseUrl}?page=1&limit=1`, { headers: authHeaders });
    assert.strictEqual(res.status, 200, 'Status code deve ser 200');
    
    const body = await res.json();
    assert.ok(body.data, 'Resposta deve conter a propriedade data');
    assert.ok(body.pagination, 'Resposta deve conter a propriedade pagination');
    assert.strictEqual(body.pagination.limit, 1, 'Limit deve ser 1');
    assert.strictEqual(body.data.length, 1, 'Deve retornar exatamente 1 item devido ao limit');
  });

  await t.test('DELETE /api/pets/:id - Sucesso ao deletar um pet', async () => {
    assert.ok(createdPetId, 'createdPetId deve existir');

    const res = await fetch(`${baseUrl}/${createdPetId}`, {
      method: 'DELETE',
      headers: authHeaders
    });

    assert.strictEqual(res.status, 204, 'Status code deve ser 204');

    // Tentar buscar o pet deletado
    const getRes = await fetch(`${baseUrl}/${createdPetId}`, { headers: authHeaders });
    assert.strictEqual(getRes.status, 404, 'Pet deletado não deve ser encontrado');
  });
});
