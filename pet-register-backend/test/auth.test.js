import { test, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../src/server.js';
import { db } from '../src/config/db.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}/api/auth`;
      resolve();
    });
  });

  db.exec("DELETE FROM users WHERE email = 'test@example.com' OR email = 'demo@petregister.com';");
});

after(() => {
  server.close();
});

test('Auth API Integration Tests', async (t) => {
  const testUser = {
    nome: 'User Test',
    email: 'test@example.com',
    password: 'password123'
  };

  await t.test('POST /api/auth/register - Sucesso ao registrar', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    assert.strictEqual(res.status, 201, 'Status code deve ser 201');
    const data = await res.json();
    assert.ok(data.token, 'Deve retornar o JWT');
    assert.strictEqual(data.user.email, testUser.email, 'Email deve corresponder');
  });

  await t.test('POST /api/auth/register - Rejeição de e-mail duplicado', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    assert.strictEqual(res.status, 409, 'Status code deve ser 409 Conflict');
    const data = await res.json();
    assert.strictEqual(data.error, 'E-mail já está em uso');
  });

  await t.test('POST /api/auth/login - Login com credenciais válidas', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });

    assert.strictEqual(res.status, 200, 'Status code deve ser 200');
    const data = await res.json();
    assert.ok(data.token, 'Deve retornar o JWT');
  });

  await t.test('POST /api/auth/login - Login com senha inválida', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'wrongpassword' })
    });

    assert.strictEqual(res.status, 401, 'Status code deve ser 401');
  });

  await t.test('POST /api/auth/demo - Login no Modo Demo', async () => {
    const res = await fetch(`${baseUrl}/demo`, { method: 'POST' });

    assert.strictEqual(res.status, 200, 'Status code deve ser 200');
    const data = await res.json();
    assert.ok(data.token, 'Deve retornar o JWT');
    assert.strictEqual(data.user.email, 'demo@petregister.com');
  });
});
