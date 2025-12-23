import mongoose, { Schema, Document } from "mongoose";
import { AddressSchema, type IAddress } from "./address.model";

interface IUSER extends Document {
    clerkId: string;
    email: string;
    name: string;
    imageUrl?: string;
    addresses: IAddress[];
    wishlist: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            default: ""
        },
        addresses: [AddressSchema],
        wishlist: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product"
            }
        ]
    },
    {
        timestamps: true
    }
);

const User = mongoose.model<IUSER>("User", UserSchema);

export default User;