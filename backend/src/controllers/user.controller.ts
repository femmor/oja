/**
 * User Controller
 */

import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/user.model";
import { ValidationError } from "../utils/errors";
import type { IAddress } from "../models/address.model";


/**
 * Address Controllers
 */
const addAddress = asyncHandler(async (req: Request, res: Response) => {
    const { label, fullName, streetAddress, city, state, zipCode, phoneNumber, isDefault } = req.body;

    // Validate required fields
    if (!label || !fullName || !streetAddress || !city || !state || !zipCode || !phoneNumber) {
        throw new ValidationError("All address fields are required.");
    }

    const userId = (req as any).auth.userId;
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

    const userId = (req as any).auth.userId;
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
    address.label = label || address.label;
    address.fullName = fullName || address.fullName;
    address.streetAddress = streetAddress || address.streetAddress;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.phoneNumber = phoneNumber || address.phoneNumber;

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
const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
    // Logic to add product to wishlist
    res.status(201).json({ message: 'Product added to wishlist' });
});

const getWishlist = asyncHandler(async (req: Request, res: Response) => {
    // Logic to get user's wishlist
    res.status(200).json({ wishlist: [] });
});

const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
    // Logic to remove product from wishlist
    res.status(200).json({ message: 'Product removed from wishlist' });
});


export { addAddress, getAddresses, updateAddress, deleteAddress, addToWishlist, getWishlist, removeFromWishlist };