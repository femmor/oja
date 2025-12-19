import mongoose, { Schema } from "mongoose";
import { CartItemSchema } from "./cart-item.model";

const CartSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        clerkId: {
            type: String,
            required: true,
            unique: true
        },
        items: [CartItemSchema]
    },
    {
        timestamps: true
    }
);

const Cart = mongoose.model("Cart", CartSchema);

export default Cart;