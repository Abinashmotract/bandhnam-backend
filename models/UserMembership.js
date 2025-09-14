import mongoose from 'mongoose';

const userMembershipSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    membershipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Membership',
        required: true
    },
    membershipName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentId: String,
    transactionId: String
}, { timestamps: true });

// Index for efficient queries
userMembershipSchema.index({ userId: 1, status: 1 });
userMembershipSchema.index({ endDate: 1 });

export default mongoose.model('UserMembership', userMembershipSchema);