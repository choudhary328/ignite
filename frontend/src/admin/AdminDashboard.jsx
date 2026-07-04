import React, { useState, useEffect, useCallback, useContext } from "react";
import Admindasnav from "../components/Admindasnav";
import "./Admindashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import {
  RiGroupFill,
  RiCalendarLine,
  RiRocketLine,
  RiAddLine,
  RiCalendarEventLine,
  RiChartBarLine,
  RiPieChartLine,
} from "react-icons/ri";

// --- CHARTS ---
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// --- MODAL COMPONENTS (Same as before, simplified for brevity in this replace) ---
// I'm assuming the existing modals are fine to be reused or I can re-include them if specific changes needed.
// For brevity, I'll include the full file content to avoid breaking things since I'm using write_to_file.

// --- Helper Components ---
function StatsCard({ title, value, note, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-text">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
        {note && <p className="stat-note">{note}</p>}
      </div>
      <div className={`stat-icon ${color}`}>
        {icon}
      </div>
    </div>
  );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    orgCount: 0,
  });
  const [roleData, setRoleData] = useState([]);
  const [eventsPerMonth, setEventsPerMonth] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching ---
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
    if (!token) {
      onLogout();
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [eventRes, userRes] = await Promise.all([
        fetch("http://localhost:5000/api/events", { headers }),
        fetch("http://localhost:5000/api/users", { headers }),
      ]);

      if (!eventRes.ok || !userRes.ok) throw new Error("Failed to fetch data");

      const events = await eventRes.json();
      const users = await userRes.json();

      // --- Process Stats ---
      const activeUsers = users.filter(u => u.status === 'Active').length;
      const orgCount = users.filter(u => u.role === 'org_admin').length;
      const totalRegistrations = events.reduce((acc, event) => acc + (event.participants?.length || 0), 0);

      setStats({
        activeUsers,
        totalEvents: events.length,
        totalRegistrations,
        orgCount,
      });

      // --- Process Charts ---
      // 1. Role Distribution
      const roleCounts = { user: 0, org_admin: 0, super_admin: 0 };
      users.forEach(u => roleCounts[u.role] = (roleCounts[u.role] || 0) + 1);
      setRoleData([
        { name: 'Students', value: roleCounts.user },
        { name: 'Organizations', value: roleCounts.org_admin },
        { name: 'Admins', value: roleCounts.super_admin },
      ]);

      // 2. Events per Month
      const monthCounts = {};
      events.forEach(e => {
        const month = new Date(e.date).toLocaleString('default', { month: 'short' });
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });
      const monthData = Object.keys(monthCounts).map(m => ({ name: m, events: monthCounts[m] }));
      setEventsPerMonth(monthData);

    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) return <div className="loading-screen">Loading Analytics...</div>;

  return (
    <div className="admin-dashboard-page">
      <Admindasnav
        userName={currentUser?.name}
        userRole={currentUser?.role}
        imageUrl={currentUser?.imageUrl}
        onLogout={onLogout}
      // onCreateEventClick removed as Super Admin focuses on Analytics
      />

      <main className="admin-main-content">
        <h1 className="dashboard-title">Platform Analytics</h1>

        {/* Stats Grid */}
        <div className="stat-grid">
          <StatsCard title="Total Users" value={stats.activeUsers} icon={<RiGroupFill />} color="blue" />
          <StatsCard title="Organizations" value={stats.orgCount} icon={<RiRocketLine />} color="green" />
          <StatsCard title="Total Events" value={stats.totalEvents} icon={<RiCalendarEventLine />} color="purple" />
          <StatsCard title="Registrations" value={stats.totalRegistrations} icon={<RiAddLine />} color="orange" />
        </div>

        {/* Charts Section */}
        <div className="charts-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <div className="chart-box" style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>User Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box" style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Events per Month</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventsPerMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="events" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manage Section Links */}
        <div className="quick-actions" style={{ marginTop: '30px' }}>
          <h3>Management</h3>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/userpage" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <RiGroupFill /> Manage Users
            </Link>
            <Link to="/eventshandal" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#f3f4f6', borderRadius: '8px', color: '#1f2937' }}>
              <RiCalendarEventLine /> Manage Events
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
