import mongoose, { Schema } from "mongoose";

export const ShippingAddressSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true
        },
        streetAddress: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const ShippingAddress = mongoose.model("ShippingAddress", ShippingAddressSchema);

export default ShippingAddress;