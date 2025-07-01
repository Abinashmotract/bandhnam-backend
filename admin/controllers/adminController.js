import User from '../../models/User.js';

// Admin Controllers
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllVendors = async (req, res) => {
    try {
        const vendors = await User.find({ role: 'vendor' }).select('-password');
        res.status(200).json({ success: true, data: vendors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Vendor Controllers
export const getVendorUsers = async (req, res) => {
    try {
        const vendorUsers = await User.find({ 
            vendorId: req.user._id 
        }).select('-password');
        
        res.status(200).json({ success: true, data: vendorUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getVendorProfile = async (req, res) => {
    try {
        const vendor = await User.findById(req.user._id).select('-password');
        res.status(200).json({ success: true, data: vendor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}; 