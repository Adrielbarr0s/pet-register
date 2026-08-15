import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { registerSchema, loginSchema } from '../schemas/authSchema.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'secret_para_desenvolvimento_nao_use_em_prod';

export const authController = {
  async googleLogin(req, res) {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Nenhuma credencial fornecida' });
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      // Check if user exists
      let stmt = db.prepare('SELECT * FROM users WHERE google_id = ?');
      let user = stmt.get(googleId);

      if (!user) {
        // Create user
        const insertStmt = db.prepare(`
          INSERT INTO users (google_id, email, nome, avatar)
          VALUES (?, ?, ?, ?)
        `);
        const result = insertStmt.run(googleId, email, name, picture);
        
        user = {
          id: Number(result.lastInsertRowid),
          google_id: googleId,
          email,
          nome: name,
          avatar: picture
        };
      } else {
        // Update user picture and name just in case they changed
        const updateStmt = db.prepare(`
          UPDATE users SET nome = ?, avatar = ? WHERE id = ?
        `);
        updateStmt.run(name, picture, user.id);
        user.nome = name;
        user.avatar = picture;
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, nome: user.nome },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({ token, user: { id: user.id, email: user.email, nome: user.nome, avatar: user.avatar } });

    } catch (error) {
      console.error('[AUTH_ERROR]', error);
      return res.status(401).json({ error: 'Falha na autenticação com o Google' });
    }
  },

  async register(req, res) {
    try {
      const data = registerSchema.parse(req.body);

      const emailCheckStmt = db.prepare('SELECT id FROM users WHERE email = ?');
      if (emailCheckStmt.get(data.email)) {
        return res.status(409).json({ error: 'E-mail já está em uso' });
      }

      const password_hash = await bcrypt.hash(data.password, 10);
      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.nome)}`;

      const stmt = db.prepare(`
        INSERT INTO users (nome, email, password_hash, avatar)
        VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(data.nome, data.email, password_hash, avatar);

      const user = {
        id: Number(result.lastInsertRowid),
        nome: data.nome,
        email: data.email,
        avatar
      };

      const token = jwt.sign({ id: user.id, email: user.email, nome: user.nome }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({ token, user });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Erro de validação', details: error.errors });
      }
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  },

  async login(req, res) {
    try {
      const data = loginSchema.parse(req.body);

      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(data.email);

      if (!user || !user.password_hash) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos' });
      }

      const isValidPassword = await bcrypt.compare(data.password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, nome: user.nome }, JWT_SECRET, { expiresIn: '7d' });
      const userData = { id: user.id, email: user.email, nome: user.nome, avatar: user.avatar };

      return res.json({ token, user: userData });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Erro de validação', details: error.errors });
      }
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  },

  async demoLogin(req, res) {
    try {
      const demoEmail = 'demo@petregister.com';
      let stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      let user = stmt.get(demoEmail);

      if (!user) {
        const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=Demo`;
        const insertStmt = db.prepare(`
          INSERT INTO users (nome, email, avatar)
          VALUES (?, ?, ?)
        `);
        const result = insertStmt.run('Usuário Demo', demoEmail, avatar);
        user = {
          id: Number(result.lastInsertRowid),
          email: demoEmail,
          nome: 'Usuário Demo',
          avatar
        };
      }

      const token = jwt.sign({ id: user.id, email: user.email, nome: user.nome }, JWT_SECRET, { expiresIn: '7d' });
      const userData = { id: user.id, email: user.email, nome: user.nome, avatar: user.avatar };

      return res.status(200).json({ token, user: userData });
    } catch (error) {
      console.error('[DEMO_LOGIN_ERROR]', error);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
};
