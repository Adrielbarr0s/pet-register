import { Router } from 'express';
import { petController } from '../controllers/petController.js';
import { vacinaController } from '../controllers/vacinaController.js';

const router = Router();

router.get('/', petController.getAll);
router.get('/:id', petController.getById);
router.post('/', petController.create);
router.put('/:id', petController.update);
router.delete('/:id', petController.delete);

router.get('/:petId/vacinas', vacinaController.getByPet);
router.post('/:petId/vacinas', vacinaController.create);
router.delete('/vacinas/:id', vacinaController.delete);

export default router;
