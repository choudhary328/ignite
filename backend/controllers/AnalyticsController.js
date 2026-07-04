import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Event from '../models/Event.js';

// @desc    Get Super Admin Dashboard Stats
// @route   GET /api/analytics/stats
// @access  Private/SuperAdmin
const getDashboardStats = asyncHandler(async (req, res) => {
    // 1. Total Counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrgs = await User.countDocuments({ role: 'org_admin' });
    const totalEvents = await Event.countDocuments({});
    const pendingEventsCount = await Event.countDocuments({ status: 'pending' });
    const verifiedOrgsCount = await User.countDocuments({ role: 'org_admin', isVerified: true });

    // 2. Total Registrations (Sum of participants in all events)
    const events = await Event.find({}, 'participants category');
    const totalRegistrations = events.reduce((acc, event) => acc + event.participants.length, 0);

    // 2b. Top Category
    const categoryCounts = {};
    events.forEach(event => {
        if (event.category) {
            categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
        }
    });
    const topCategory = Object.keys(categoryCounts).length > 0
        ? Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    // 3. Events Created Per Month (for Chart)
    // Aggregate events by month
    const eventsByMonth = await Event.aggregate([
        {
            $group: {
                _id: { $month: { $toDate: '$createdAt' } },
                count: { $sum: 1 },
            },
        },
        { $sort: { '_id': 1 } } // Sort by month
    ]);

    // Format for Recharts (Month Name, Count)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = eventsByMonth.map(item => ({
        name: monthNames[item._id - 1],
        events: item.count
    }));

    // 4. Recent Users (Last 5)
    const recentUsers = await User.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt');

    // 4b. Recent Events (Last 5)
    const recentEvents = await Event.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title date category status createdAt createdBy')
        .populate('createdBy', 'name');

    // 5. Build Response
    res.json({
        totalUsers,
        totalOrgs,
        totalEvents,
        totalRegistrations,
        pendingEventsCount,
        verifiedOrgsCount,
        monthlyData,
        recentUsers,
        recentEvents,
        topCategory
    });
});

export { getDashboardStats };
