import { Router } from 'express';
import { createProduct, deleteProduct, getAllCustomers, getAllOrders, getAllProducts, getDashboardStats, getOrderById, updateOrderStatus, updateProduct } from '../controllers/admin.controller';
import { adminOnly, protectRoute } from '../middleware/auth.middleware';
import upload from '../middleware/multer.middleware';

const router = Router();

router.use(protectRoute, adminOnly);

// Products routes
router.post('/products', upload.array('images', 3), createProduct);
router.get('/products', getAllProducts);
router.put('/products/:id', upload.array('images', 3), updateProduct);
router.delete('/products/:id', deleteProduct);

//  Orders routes
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

// Customers routes:
router.get('/customers', getAllCustomers);
router.get('/stats', getDashboardStats);

export default router;