import { Schema, model } from "mongoose";

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

const Address = model("Address", AddressSchema);

export default Address;