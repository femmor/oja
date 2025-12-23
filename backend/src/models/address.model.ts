import { Document, Schema, model } from "mongoose";

export interface IAddress {
    label: string;
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
    isDefault: boolean;
}

interface Address extends Document {
    label: string;
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const AddressSchema = new Schema({
    label: {
        type: String,
        required: true
    },
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
    phoneNumber: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
);

const Address = model<Address>("Address", AddressSchema);

export default Address;