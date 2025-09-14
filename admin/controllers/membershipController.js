import MembershipPlan from "../../models/MembershipPlan.js";


const createMembershipPlan = async (req, res) => {
    try {
        const {
            name,
            price,
            duration,
            features,
            description,
            isActive,
        } = req.body;

        const existingPlan = await MembershipPlan.findOne({
            name,
            duration,
            isActive: true,
        });

        if (existingPlan) {
            return res.status(409).json({
                status: 409,
                success: false,
                message: `An active plan with this name ${name} and duration ${duration} already exists.`
            });
        }

        const newPlan = new MembershipPlan({
            name,
            price,
            duration,
            features,
            description,
            isActive,
        });

        await newPlan.save();

        res.status(201).json({
            status: 201,
            success: true,
            message: "Membership plan created successfully.",
            data: newPlan
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: error.message,
        });
    }
}

const updateMembershipPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            price,
            duration,
            features,
            description,
            isActive,
        } = req.body;

        const existingPlan = await MembershipPlan.findOne({
            _id: { $ne: id },
            name,
            duration,
            isActive: true,
        });

        if (existingPlan) {
            return res.status(409).json({
                status: 409,
                success: false,
                message: `An active plan with this name "${name}" and duration "${duration}" already exists.`,
            });
        }

        const updatedPlan = await MembershipPlan.findByIdAndUpdate(
            id,
            {
                name,
                price,
                duration,
                features,
                description,
                isActive,
            },
            { new: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Membership plan not found.",
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "Membership plan updated successfully.",
            data: updatedPlan
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: error.message,
        });
    }
}

const deleteMembershipPlan = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPlan = await MembershipPlan.findByIdAndDelete(id);
        if (!deletedPlan) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Membership plan not found.",
            });
        }
        res.status(200).json({
            status: 200,
            success: true,
            message: "Membership plan deleted successfully.",
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: error.message,
        });
    }
}

const getAllMembershipPlans = async (req, res) => {
    try {
        let aggregation = [];

        aggregation.push({
            $lookup: {
                from: "usermemberships",
                localField: "_id",
                foreignField: "membershipId",
                as: "userMemberships"
            }
        });

        aggregation.push({
            $addFields: {
                totalSubscribed: {
                    $size: {
                        $filter: {
                            input: "$userMemberships",
                            as: "membership",
                            cond: { $eq: ["$$membership.status", "active"] }
                        }
                    }
                }
            }
        });
        aggregation.push({ $project: { userMemberships: 0, __v: 0, updatedAt: 0 } });

        const plans = await MembershipPlan.aggregate(aggregation);
        res.status(200).json({
            status: 200,
            success: true,
            message: "Membership plans retrieved successfully.",
            data: plans
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            message: error.message,
        });
    }
}

export { createMembershipPlan, updateMembershipPlan, deleteMembershipPlan, getAllMembershipPlans };