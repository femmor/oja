/**
 * User Controller
 */

import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/user.model";
import { ValidationError } from "../utils/errors";
import type { IAddress } from "../models/address.model";
import type { RequestWithAuth } from "../middleware/auth.middleware";

/**
 * Address Controllers
 */
const addAddress = asyncHandler(async (req: Request, res: Response) => {
    const { label, fullName, streetAddress, city, state, zipCode, phoneNumber, isDefault } = req.body;

    // Validate required fields
    if (!label || !fullName || !streetAddress || !city || !state || !zipCode || !phoneNumber) {
        throw new ValidationError("All address fields are required.");
    }

    const userId = (req as RequestWithAuth).auth.userId;
    const user = await User.findById(userId);

    if (!user) {
        throw new ValidationError("User not found.");
    }

    // Check if isDefault is true, then unset previous default addresses
    if (isDefault) {
        user.addresses.forEach(address => {
            address.isDefault = false;
        });
    }

    const newAddress: IAddress = {
        label,
        fullName,
        streetAddress,
        city,
        state,
        zipCode,
        phoneNumber,
        isDefault: !!isDefault
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({ message: 'Address added successfully', address: newAddress });
});

const getAddresses = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).auth.userId;
    const user = await User.findById(userId);

    if (!user) {
        throw new ValidationError("User not found.");
    }

    res.status(200).json({ addresses: user.addresses });
});

const updateAddress = asyncHandler(async (req: Request, res: Response) => {
    const { label, fullName, streetAddress, city, state, zipCode, phoneNumber, isDefault } = req.body;

    // Validation: At least one field must be provided for update
    if (!label && !fullName && !streetAddress && !city && !state && !zipCode && !phoneNumber && isDefault === undefined) {
        throw new ValidationError("At least one field must be provided for update.");
    }

    const userId = (req as RequestWithAuth).auth.userId;
    const addressId = req.params.addressId;

    const user = await User.findById(userId);

    if (!user) {
        throw new ValidationError("User not found.");
    }

    const address = user.addresses.find((addr: IAddress & { _id?: any }) => addr._id?.toString() === addressId);
    if (!address) {
        throw new ValidationError("Address not found.");
    }

    // Update address fields
    address.label = label ?? address.label;
    address.fullName = fullName ?? address.fullName;
    address.streetAddress = streetAddress ?? address.streetAddress;
    address.city = city ?? address.city;
    address.state = state ?? address.state;
    address.zipCode = zipCode ?? address.zipCode;
    address.phoneNumber = phoneNumber ?? address.phoneNumber;

    // If isDefault is true, unset previous default addresses
    if (isDefault) {
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });
        address.isDefault = true;
    } else if (isDefault === false) {
        address.isDefault = false;
    }

    await user.save();

    res.status(200).json({
        message: 'Address updated successfully', address
    });
});

const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
    const { addressId } = req.params;
    const userId = (req as any).auth.userId;

    const user = await User.findById(userId);

    if (!user) {
        throw new ValidationError("User not found.");
    }

    const addressIndex = user.addresses.findIndex((addr: IAddress & { _id?: any }) => addr._id?.toString() === addressId);
    if (addressIndex === -1) {
        throw new ValidationError("Address not found.");
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    res.status(200).json({ message: 'Address deleted successfully' });
});


/**
 * Wishlist Controllers
 */

const getWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).auth.userId;
    const user = await User.findById(userId).populate('wishlist');

    if (!user) {
        throw new ValidationError("User not found.");
    }

    res.status(200).json({ wishlist: user.wishlist });
});

const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.body;
    const userId = (req as any).auth.userId;

    const user = await User.findById(userId);

    if (!user) {
        throw new ValidationError("User not found.");
    }

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
        throw new ValidationError("Product is already in wishlist.");
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({ message: 'Product added to wishlist' });
});

const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const userId = (req as any).auth.userId;

    const user = await User.findById(userId);

    if (!user) {
        throw new ValidationError("User not found.");
    }

    const originalLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter((id: any) => id.toString() !== productId);

    if (user.wishlist.length === originalLength) {
        throw new ValidationError("Product not found in wishlist.");
    }
    await user.save();

    res.status(200).json({ message: 'Product removed from wishlist' });
});


export { addAddress, getAddresses, updateAddress, deleteAddress, addToWishlist, getWishlist, removeFromWishlist };