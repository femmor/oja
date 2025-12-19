import mongoose, { Schema } from "mongoose";

export const OrderItemSchema = new Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        image: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const OrderItem = mongoose.model("OrderItem", OrderItemSchema);

export default OrderItem;