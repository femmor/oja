import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary";
import Product, { type IProduct } from "../models/product.model";
import { ValidationError, NotFoundError } from "../utils/errors";
import Order from "../models/order.model";
import User from "../models/user.model";

/**
 * Admin Controllers
 * Handles product, order, and customer management for admin users.
 */

/*
   Product Controllers
**/
const createProduct = asyncHandler(async (req: Request, res: Response) => {
    // Extract product details from request body
    const { name, price, description, stock, category } = req.body;

    // Validate required fields
    if (!name || !price || !description || !stock || !category) {
        throw new ValidationError("All fields are required.");
    }

    // Validate images
    if (!req.files || req.files.length === 0) {
        throw new ValidationError("At least one image is required.");
    }

    // Limit to 3 images
    if ((req.files as Express.Multer.File[]).length > 3) {
        throw new ValidationError("No more than 3 images are allowed.");
    }

    // Upload images to cloudinary
    const imageUploadPromises = (req.files as Express.Multer.File[]).map(file => {
        return cloudinary.uploader.upload(file.path, { folder: "products" });
    });

    // Handle the upload results
    const uploadResults = await Promise.all(imageUploadPromises);
    const imageUrls = uploadResults.map(result => result.secure_url);

    // Create product object with proper typing
    const newProduct: Partial<IProduct> = {
        name,
        price: parseFloat(price),
        description,
        stock: parseInt(stock, 10),
        category,
        images: imageUrls,
    };

    const createdProduct = await Product.create(newProduct);

    console.log('Product created successfully:', {
        productId: createdProduct._id,
        name: createdProduct.name,
        timestamp: new Date().toISOString()
    });

    res.status(201).json({
        message: "Product created successfully.",
        product: createdProduct,
    });
});

const getAllProducts = asyncHandler(async (_req: Request, res: Response) => {
    const products = await Product.find().sort({ createdAt: -1 }); // Latest products first
    res.status(200).json({ products });
});

const updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, price, description, stock, category } = req.body;

    // Validate required fields
    if (!name || !price || !description || !stock || !category) {
        throw new ValidationError("All fields are required.");
    }

    // First, find the existing product to get current images
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
        throw new NotFoundError("Product");
    }

    // Prepare update object
    const updateData: Partial<IProduct> = {
        name,
        price: parseFloat(price),
        description,
        stock: parseInt(stock, 10),
        category,
    };

    // Handle image updates if new images are provided
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
        const files = req.files as Express.Multer.File[];

        // Limit to 3 images
        if (files.length > 3) {
            throw new ValidationError("No more than 3 images are allowed.");
        }

        // Upload new images to cloudinary
        const imageUploadPromises = files.map(file => {
            return cloudinary.uploader.upload(file.path, { folder: "products" });
        });

        const uploadResults = await Promise.all(imageUploadPromises);
        const newImageUrls = uploadResults.map(result => result.secure_url);

        // Delete old images from cloudinary (optional - helps manage storage)
        if (existingProduct.images && existingProduct.images.length > 0) {
            const deletePromises = existingProduct.images.map(imageUrl => {
                // Robustly extract public_id from cloudinary URL
                const match = imageUrl.match(/\/products\/([^/.]+)/);
                const publicId = match ? match[1] : null;
                if (publicId) {
                    return cloudinary.uploader.destroy(`products/${publicId}`);
                }
            }).filter(Boolean);

            await Promise.all(deletePromises);
        }

        // Update the images in the update data
        updateData.images = newImageUrls;
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    console.log('Product updated successfully:', {
        productId: updatedProduct?._id,
        name: updatedProduct?.name,
        timestamp: new Date().toISOString()
    });

    res.status(200).json({
        message: "Product updated successfully.",
        product: updatedProduct,
    });
});

const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
        throw new NotFoundError("Product");
    }

    // delete images from cloudinary
    if (product.images && product.images.length > 0) {
        const deletePromises = product.images.map(imageUrl => {
            // Robustly extract public_id from cloudinary URL
            const match = imageUrl.match(/\/products\/([^/.]+)/);
            const publicId = match ? match[1] : null;
            if (publicId) {
                return cloudinary.uploader.destroy(`products/${publicId}`);
            }
        }).filter(Boolean);

        await Promise.all(deletePromises);
    }

    await Product.findByIdAndDelete(id);

    console.log('Product deleted successfully:', {
        productId: id,
        name: product.name,
        timestamp: new Date().toISOString()
    });

    res.status(200).json({ message: "Product deleted successfully." });
});


/*
    Order Controllers
**/

const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
    const orders = await Order.find()
        .populate("user", "name email")
        .populate("orderItems.product")
        .sort({ createdAt: -1 });

    res.status(200).json({ orders });
});

const getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const order = await Order.findById(id)
        .populate("user", "name email")
        .populate("orderItems.product")

    if (!order) {
        throw new NotFoundError("Order");
    }

    res.status(200).json({ order });
});

const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "shipped", "delivered", "cancelled"].includes(status)) {
        throw new ValidationError("Invalid order status. Must be one of: pending, shipped, delivered, cancelled");
    }

    const order = await Order.findById(id);

    if (!order) {
        throw new NotFoundError("Order");
    }

    order.orderStatus = status;

    if (status === "shipped" && !order.shippedAt) {
        order.shippedAt = new Date();
    }

    if (status === "delivered" && !order.deliveredAt) {
        order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({ message: `Order ${id} status updated to ${status}`, order });
});

/*
    Customers Controllers
**/
const getAllCustomers = asyncHandler(async (_req: Request, res: Response) => {
    const customers = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ customers });
});

const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments();

    // Calculate total revenue
    const orders = await Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$totalPrice" }
            }
        }
    ]);

    const totalRevenue = orders[0]?.total || 0;

    res.status(200).json({
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue
    });
});

export { createProduct, getAllProducts, updateProduct, deleteProduct, getAllOrders, getOrderById, updateOrderStatus, getAllCustomers, getDashboardStats };