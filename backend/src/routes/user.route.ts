import { Router } from 'express';
import { addAddress, addToWishlist, deleteAddress, getAddresses, getWishlist, removeFromWishlist, updateAddress } from '../controllers/user.controller';
import { protectRoute } from '../middleware/auth.middleware';

const router = Router();

router.use(protectRoute);

// Address management routes
router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

// Wishlist routes
router.get("/wishlist", getWishlist);
router.post("/wishlist", addToWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);

export default router;