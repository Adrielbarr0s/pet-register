import { db } from '../config/db.js';
import { petCreateSchema, petUpdateSchema } from '../schemas/petSchema.js';

export const petController = {
  getAll(req, res) {
    const { especie, search, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let countQuery = 'SELECT COUNT(*) as total FROM pets WHERE user_id = ?';
    let dataQuery = 'SELECT * FROM pets WHERE user_id = ?';
    const params = [req.user.id];

    if (especie) {
      countQuery += ' AND especie = ?';
      dataQuery += ' AND especie = ?';
      params.push(especie);
    }
    if (search) {
      countQuery += ' AND (nome LIKE ? OR tutor_nome LIKE ?)';
      dataQuery += ' AND (nome LIKE ? OR tutor_nome LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const totalStmt = db.prepare(countQuery);
    const totalResult = totalStmt.get(...params);
    const total = totalResult ? totalResult.total : 0;

    dataQuery += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    const dataStmt = db.prepare(dataQuery);
    const rows = dataStmt.all(...params, Number(limit), Number(offset));

    return res.json({
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  },

  getById(req, res) {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM pets WHERE id = ? AND user_id = ?');
    const pet = stmt.get(Number(id), req.user.id);

    if (!pet) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }

    return res.json(pet);
  },

  create(req, res) {
    const data = petCreateSchema.parse(req.body);

    const stmt = db.prepare(`
      INSERT INTO pets (user_id, nome, especie, raca, idade, peso, tutor_nome, tutor_contato)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      req.user.id,
      data.nome,
      data.especie,
      data.raca,
      data.idade ?? null,
      data.peso ?? null,
      data.tutor_nome,
      data.tutor_contato
    );

    return res.status(201).json({ id: Number(result.lastInsertRowid), ...data });
  },

  update(req, res) {
    const { id } = req.params;
    const data = petUpdateSchema.parse(req.body);

    const keys = Object.keys(data);
    if (keys.length === 0) {
      return res.status(400).json({ error: 'Nenhum dado informado para atualização' });
    }

    const fields = keys.map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), Number(id), req.user.id];

    const stmt = db.prepare(`UPDATE pets SET ${fields} WHERE id = ? AND user_id = ?`);
    const result = stmt.run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }

    return res.json({ message: 'Pet atualizado com sucesso' });
  },

  delete(req, res) {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM pets WHERE id = ? AND user_id = ?');
    const result = stmt.run(Number(id), req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }

    return res.status(204).send();
  }
};
