import { Router } from 'express';
import { createProduct, deleteProduct, getAllProducts, updateProduct } from '../controllers/admin.controller';
import { adminOnly, protectRoute } from '../middleware/auth.middleware';
import upload from '../middleware/multer.middleware';

const router = Router();

router.use(protectRoute, adminOnly);

router.post('/products', upload.array('images', 3), createProduct);
router.get('/products', getAllProducts);
router.put('/products/:id', upload.array('images', 3), updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;