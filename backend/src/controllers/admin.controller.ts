import type { Request, Response } from "express";

const createProduct = (req: Request, res: Response) => {
    // implementation
    // Access auth data using: (req as any).auth.userId
    // Access user data using: (req as any).user
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