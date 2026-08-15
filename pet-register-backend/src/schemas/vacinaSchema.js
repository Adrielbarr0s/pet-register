import { z } from 'zod';

export const vacinaCreateSchema = z.object({
  nome: z.string().trim().min(2, 'Nome da vacina obrigatório'),
  data_aplicacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de aplicação inválida (YYYY-MM-DD)'),
  proxima_dose: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data da próxima dose inválida').optional().nullable()
});
