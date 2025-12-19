import mongoose, { Schema } from "mongoose";
import { OrderItemSchema } from "./order-item.model";
import { ShippingAddressSchema } from "./shipping-address.model";

export enum OrderStatus {
    PENDING = "pending",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}

const OrderSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        clerkId: {
            type: String,
            required: true
        },
        orderItems: [OrderItemSchema],
        shippingAddress: {
            type: ShippingAddressSchema,
            required: true
        },
        paymentResult: {
            id: String,
            status: String,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },
        orderStatus: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING
        },
        deliveredAt: {
            type: Date
        },
        shippedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", OrderSchema);

export default Order;