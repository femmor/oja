import type { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import Product, { type IProduct } from "../models/product.model";

const createProduct = async (req: Request, res: Response) => {
    try {
        // Extract product details from request body
        const { name, price, description, stock, category } = req.body;

        // Validate required fields
        if (!name || !price || !description || !stock || !category) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Validate images
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required." });
        }

        // Limit to 3 images
        if ((req.files as Express.Multer.File[]).length > 3) {
            return res.status(400).json({ message: "No more than 3 images are allowed." });
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
        return res.status(201).json({
            message: "Product created successfully.",
            product: createdProduct,
        });
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

const getAllProducts = (req: Request, res: Response) => {
    // implementation
}

const updateProduct = (req: Request, res: Response) => {
    // implementation
}

const deleteProduct = (req: Request, res: Response) => {
    // implementation
}

export { createProduct, getAllProducts, updateProduct, deleteProduct };