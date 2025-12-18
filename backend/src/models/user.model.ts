import mongoose, { Schema } from "mongoose";
import { AddressSchema } from "./address.model";

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

const User = mongoose.model("User", UserSchema);

export default User;