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

const getAllProducts = async (_req: Request, res: Response) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }); // Latest products first
        return res.status(200).json({ products });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, price, description, stock, category } = req.body;

        // Validate required fields
        if (!name || !price || !description || !stock || !category) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // First, find the existing product to get current images
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found." });
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
                return res.status(400).json({ message: "No more than 3 images are allowed." });
            }

            try {
                // Upload new images to cloudinary
                const imageUploadPromises = files.map(file => {
                    return cloudinary.uploader.upload(file.path, { folder: "products" });
                });

                const uploadResults = await Promise.all(imageUploadPromises);
                const newImageUrls = uploadResults.map(result => result.secure_url);

                // Delete old images from cloudinary (optional - helps manage storage)
                if (existingProduct.images && existingProduct.images.length > 0) {
                    const deletePromises = existingProduct.images.map(imageUrl => {
                        // Extract public_id from cloudinary URL
                        const publicId = imageUrl.split('/').pop()?.split('.')[0];
                        if (publicId) {
                            return cloudinary.uploader.destroy(`products/${publicId}`);
                        }
                    }).filter(Boolean);

                    await Promise.all(deletePromises);
                }

                // Update the images in the update data
                updateData.images = newImageUrls;
            } catch (uploadError) {
                console.error("Error uploading images:", uploadError);
                return res.status(500).json({ message: "Failed to upload images." });
            }
        }

        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

        return res.status(200).json({
            message: "Product updated successfully.",
            product: updatedProduct,
        });

    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // delete images from cloudinary
        if (product.images && product.images.length > 0) {
            const deletePromises = product.images.map(imageUrl => {
                const publicId = imageUrl.split('/').pop()?.split('.')[0];
                if (publicId) {
                    return cloudinary.uploader.destroy(`products/${publicId}`);
                }
            }).filter(Boolean);

            await Promise.all(deletePromises);
        }

        await Product.findByIdAndDelete(id);

        return res.status(200).json({ message: "Product deleted successfully." });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export { createProduct, getAllProducts, updateProduct, deleteProduct };