import React, { useState, useEffect, useContext } from 'react';
import {
    RiUserLine,
    RiCalendarEventLine,
    RiBuildingLine,
    RiGroupLine,
    RiArrowRightLine,
    RiShieldCheckLine,
    RiPieChartLine,
    RiSettings4Line,
    RiCheckDoubleLine,
    RiBarChartBoxLine,
    RiFireLine,
    RiTrophyLine,
} from 'react-icons/ri';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { UserContext } from '../context/UserContext';
import Admindasnav from '../components/Admindasnav';
import { Link } from 'react-router-dom';
import './Admindashboard.css';

const StatCard = ({ title, count, icon, color }) => (
    <div className="stat-card">
        <div className={`stat-icon-wrapper ${color}`}>
            {icon}
        </div>
        <div className="stat-content">
            <h3>{count}</h3>
            <p>{title}</p>
        </div>
    </div>
);

const ActivityItem = ({ user }) => (
    <div className="activity-item">
        <div className="user-avatar-sm">
            {user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="activity-info">
            <h4>{user.name}</h4>
            <p>{user.email}</p>
        </div>
        <div className="activity-date">
            {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
    </div>
);

const SuperAdminDashboard = ({ onLogout }) => {
    const { currentUser } = useContext(UserContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
                const response = await fetch("http://localhost:5000/api/analytics/stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) throw new Error("Failed to load analytics.");
                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div className="loading-screen">
            <div className="loader-spinner"></div>
            <span>Loading Ignite Intelligence...</span>
        </div>
    );

    if (error) return <div className="error-screen">Error: {error}</div>;

    return (
        <div className="admin-dashboard-page">
            <Admindasnav
                userName={currentUser?.name}
                userRole="Super Admin"
                imageUrl={currentUser?.imageUrl}
                onLogout={onLogout}
            />

            <main className="admin-main-content">
                {/* 1. Hero Section */}
                <section className="admin-hero">
                    <div className="admin-hero-content">
                        <h1>Welcome back, {currentUser?.name?.split(' ')[0]}! ✨</h1>
                        <p>Your Ignite dashboard is up to date. You have <strong>{stats?.pendingEventsCount || 0} event requests</strong> awaiting your approval today.</p>
                    </div>
                </section>

                {/* 2. Stat Cards Grid */}
                <div className="stats-grid">
                    <StatCard
                        title="Total Active Users"
                        count={stats?.totalUsers || 0}
                        icon={<RiUserLine />}
                        color="blue"
                    />
                    <StatCard
                        title="Hosting Orgs"
                        count={stats?.totalOrgs || 0}
                        icon={<RiBuildingLine />}
                        color="indigo"
                    />
                    <StatCard
                        title="Verified Partners"
                        count={stats?.verifiedOrgsCount || 0}
                        icon={<RiShieldCheckLine />}
                        color="green"
                    />
                    <StatCard
                        title="Total Events"
                        count={stats?.totalEvents || 0}
                        icon={<RiCalendarEventLine />}
                        color="purple"
                    />
                    <StatCard
                        title="Pending Requests"
                        count={stats?.pendingEventsCount || 0}
                        icon={<RiCalendarEventLine />}
                        color="red"
                    />
                    <StatCard
                        title="Registrations"
                        count={stats?.totalRegistrations || 0}
                        icon={<RiGroupLine />}
                        color="orange"
                    />
                </div>

                <div className="dashboard-grid-main">
                    {/* 3. Main Chart Section */}
                    <div className="chart-card">
                        <div className="section-header">
                            <h3>Growth & Engagement</h3>
                            <div className="chart-legend">
                                <span className="legend-item"><span className="dot" style={{ background: '#6366f1' }}></span> Events Growth</span>
                            </div>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={stats?.monthlyData}>
                                    <defs>
                                        <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="events"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorEvents)"
                                        name="Events Created"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Platform Highlights */}
                        <div className="platform-highlights">
                            <div className="highlight-tile">
                                <div className="highlight-icon green">
                                    <RiCheckDoubleLine />
                                </div>
                                <div className="highlight-info">
                                    <span className="highlight-value">
                                        {stats?.totalEvents > 0
                                            ? Math.round(((stats?.totalEvents - (stats?.pendingEventsCount || 0)) / stats?.totalEvents) * 100)
                                            : 0}%
                                    </span>
                                    <span className="highlight-label">Approval Rate</span>
                                </div>
                            </div>
                            <div className="highlight-tile">
                                <div className="highlight-icon blue">
                                    <RiBarChartBoxLine />
                                </div>
                                <div className="highlight-info">
                                    <span className="highlight-value">
                                        {stats?.totalEvents > 0
                                            ? Math.round((stats?.totalRegistrations || 0) / stats?.totalEvents)
                                            : 0}
                                    </span>
                                    <span className="highlight-label">Avg Participants</span>
                                </div>
                            </div>
                            <div className="highlight-tile">
                                <div className="highlight-icon purple">
                                    <RiFireLine />
                                </div>
                                <div className="highlight-info">
                                    <span className="highlight-value">
                                        {stats?.totalUsers > 0
                                            ? Math.round(((stats?.totalRegistrations || 0) / stats?.totalUsers) * 100)
                                            : 0}%
                                    </span>
                                    <span className="highlight-label">Engagement Rate</span>
                                </div>
                            </div>
                            <div className="highlight-tile">
                                <div className="highlight-icon orange">
                                    <RiTrophyLine />
                                </div>
                                <div className="highlight-info">
                                    <span className="highlight-value">{stats?.topCategory || 'N/A'}</span>
                                    <span className="highlight-label">Top Category</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Events Created */}
                        <div className="recent-events-section">
                            <div className="section-header">
                                <h3>Recent Events Created</h3>
                                <Link to="/eventshandal" className="view-all-link" style={{ fontSize: '0.875rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                                    View All
                                </Link>
                            </div>
                            <div className="recent-events-list">
                                {stats?.recentEvents?.map(event => (
                                    <div key={event._id} className="recent-event-item">
                                        <div className="recent-event-info">
                                            <h4 className="recent-event-title">{event.title}</h4>
                                            <p className="recent-event-org">
                                                by {event.createdBy?.name || 'Unknown'}
                                            </p>
                                        </div>
                                        <span className={`status-pill ${event.status}`}>
                                            {event.status}
                                        </span>
                                        <span className="recent-event-category">{event.category}</span>
                                        <span className="recent-event-date">
                                            {new Date(event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))}
                                {(!stats?.recentEvents || stats.recentEvents.length === 0) && (
                                    <p style={{ textAlign: 'center', color: '#9ca3af', padding: '1rem' }}>No events yet</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 4. Side Column: Activity & Actions */}
                    <div className="side-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div className="quick-actions-card">
                            <div className="section-header">
                                <h3>Quick Actions</h3>
                            </div>
                            <div className="quick-actions-grid">
                                <Link to="/eventshandal" className="action-card-btn red">
                                    <div className="action-icon"><RiCalendarEventLine /></div>
                                    <div className="action-content">
                                        <span>Event Approvals</span>
                                        <p>Review pending requests</p>
                                    </div>
                                    <RiArrowRightLine className="arrow" />
                                </Link>

                                <Link to="/userpage" className="action-card-btn blue">
                                    <div className="action-icon"><RiUserLine /></div>
                                    <div className="action-content">
                                        <span>Organization Audit</span>
                                        <p>Verify & manage hosts</p>
                                    </div>
                                    <RiArrowRightLine className="arrow" />
                                </Link>

                                <Link to="/userpage" className="action-card-btn indigo">
                                    <div className="action-icon"><RiGroupLine /></div>
                                    <div className="action-content">
                                        <span>Community Hub</span>
                                        <p>Manage users & roles</p>
                                    </div>
                                    <RiArrowRightLine className="arrow" />
                                </Link>

                                <Link to="/adminprofile" className="action-card-btn purple">
                                    <div className="action-icon"><RiSettings4Line /></div>
                                    <div className="action-content">
                                        <span>Admin Settings</span>
                                        <p>System configuration</p>
                                    </div>
                                    <RiArrowRightLine className="arrow" />
                                </Link>
                            </div>
                        </div>

                        {/* Recent Users */}
                        <div className="recent-section">
                            <div className="section-header">
                                <h3>Recent Signups</h3>
                                <Link to="/userpage" className="view-all-link" style={{ fontSize: '0.875rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                                    View All
                                </Link>
                            </div>
                            <div className="activity-list">
                                {stats?.recentUsers?.map(user => (
                                    <ActivityItem key={user._id} user={user} />
                                ))}
                                {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                                    <p className="no-data" style={{ textAlign: 'center', color: '#9ca3af', padding: '1rem' }}>No recent users</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default SuperAdminDashboard;
