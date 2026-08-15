import { db } from '../config/db.js';
import { vacinaCreateSchema } from '../schemas/vacinaSchema.js';

export const vacinaController = {
  getByPet(req, res) {
    const { petId } = req.params;
    const petStmt = db.prepare('SELECT id FROM pets WHERE id = ? AND user_id = ?');
    if (!petStmt.get(Number(petId), req.user.id)) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }
    const stmt = db.prepare('SELECT * FROM vacinas WHERE pet_id = ? ORDER BY data_aplicacao DESC');
    return res.json(stmt.all(Number(petId)));
  },

  create(req, res) {
    const { petId } = req.params;
    const data = vacinaCreateSchema.parse(req.body);

    const petStmt = db.prepare('SELECT id FROM pets WHERE id = ? AND user_id = ?');
    if (!petStmt.get(Number(petId), req.user.id)) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }

    const stmt = db.prepare(`
      INSERT INTO vacinas (pet_id, nome, data_aplicacao, proxima_dose)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(Number(petId), data.nome, data.data_aplicacao, data.proxima_dose || null);
    return res.status(201).json({ id: Number(result.lastInsertRowid), pet_id: Number(petId), ...data });
  },

  delete(req, res) {
    const { id } = req.params;
    const stmt = db.prepare(`
      DELETE FROM vacinas 
      WHERE id = ? 
      AND pet_id IN (SELECT id FROM pets WHERE user_id = ?)
    `);
    const result = stmt.run(Number(id), req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Registro de vacina não encontrado' });
    }

    return res.status(204).send();
  }
};
