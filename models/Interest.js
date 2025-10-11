import mongoose from 'mongoose';

const interestSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['interest', 'super_interest'],
    default: 'interest'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'shortlisted'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 500
  },
  isRead: {
    type: Boolean,
    default: false
  },
  respondedAt: {
    type: Date
  },
  responseMessage: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for better query performance
interestSchema.index({ fromUser: 1, targetUser: 1 });
interestSchema.index({ targetUser: 1, status: 1 });
interestSchema.index({ createdAt: -1 });

// Prevent duplicate interests
interestSchema.index({ fromUser: 1, targetUser: 1, type: 1 }, { unique: true });

const Interest = mongoose.model('Interest', interestSchema);

export default Interest;
