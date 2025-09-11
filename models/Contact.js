// models/Contact.js
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "resolved"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
