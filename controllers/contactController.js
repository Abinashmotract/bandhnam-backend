// controllers/contactController.js
import Contact from "../models/Contact.js";
import sendEmail from "../utils/sendEmail.js";

// 📌 Create a new contact request
export const createContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Name, email, subject, and message are required",
            });
        }

        const contact = await Contact.create({ name, email, phone, subject, message });

        // Prepare email content
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1976d2;">New Contact Request</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || "N/A"}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <br/>
                <p style="color:#555;">Bandhanam Nammatch System</p>
            </div>
        `;

        // Send email to admin (support inbox)
        await sendEmail(
            process.env.ADMIN_EMAIL || "support@bandhanam.com",
            "New Contact Request - Bandhanam Nammatch",
            html
        );

        return res.status(201).json({
            success: true,
            status: 201,
            message: "Contact request submitted successfully",
        });
    } catch (err) {
        console.error("Create contact error:", err);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Server error",
            error: err.message,
        });
    }
};

// 📌 Get all contact requests (Admin only)
export const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Contacts fetched successfully",
            data: contacts,
        });
    } catch (err) {
        console.error("Get contacts error:", err);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Server error",
            error: err.message,
        });
    }
};

// 📌 Update contact status (mark as resolved)
export const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Contact request not found",
            });
        }

        contact.status = status || "pending";
        await contact.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Contact status updated successfully",
            data: contact,
        });
    } catch (err) {
        console.error("Update contact status error:", err);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Server error",
            error: err.message,
        });
    }
};
