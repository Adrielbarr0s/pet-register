import { z } from 'zod';

export const petCreateSchema = z.object({
  nome: z.string().trim().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  especie: z.enum(['Cachorro', 'Gato', 'Ave', 'Outro'], {
    errorMap: () => ({ message: 'Espécie inválida (opções: Cachorro, Gato, Ave, Outro)' })
  }),
  raca: z.string().trim().max(50).optional().default('SRD'),
  idade: z.number().int().nonnegative('A idade deve ser maior ou igual a zero').optional(),
  peso: z.number().positive('O peso deve ser positivo').optional(),
  tutor_nome: z.string().trim().min(3, 'Nome do tutor obrigatório'),
  tutor_contato: z.string().trim().min(8, 'Contato do tutor obrigatório')
});

export const petUpdateSchema = petCreateSchema.partial();
