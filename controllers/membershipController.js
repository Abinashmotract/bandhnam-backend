import MembershipPlan from '../models/MembershipPlan.js';

const getAllMembershipPlans = async (req, res) => {
  try {
    const { duration = "yearly" } = req.query;
    let aggregation = [];
    aggregation.push({ $match: { duration, isActive: true } });
    aggregation.push({
      $project: {
        name: 1,
        price: 1,
        duration: 1,
        features: 1,
        description: 1,
        isPopular: 1,
      }
    })

    const plans = await MembershipPlan.aggregate(aggregation);

    if (!plans || plans.length === 0) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: `No membership plans found for ${duration}.`,
      });
    }

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

export {
  getAllMembershipPlans
};
