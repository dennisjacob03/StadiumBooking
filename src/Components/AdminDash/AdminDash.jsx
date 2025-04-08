import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Adminnavbar from "../Adminnavbar/Adminnavbar";
import "./AdminDash.css";
import {
  FaUsers,
  FaCalendarAlt,
  FaBuilding,
  FaLayerGroup,
  FaChair,
  FaArrowRight,
} from "react-icons/fa";

const AdminDash = () => {
  const { currentUser } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalStadiums: 0,
    totalCategories: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersCount = usersSnapshot.size;

        // Fetch events count
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const eventsCount = eventsSnapshot.size;

        // Fetch stadiums count
        const stadiumsSnapshot = await getDocs(collection(db, "stadiums"));
        const stadiumsCount = stadiumsSnapshot.size;

        // Fetch categories count
        const categoriesSnapshot = await getDocs(
          collection(db, "stadium_categories")
        );
        const categoriesCount = categoriesSnapshot.size;

        // Fetch bookings count
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));
        const bookingsCount = bookingsSnapshot.size;

        setDashboardStats({
          totalUsers: usersCount,
          totalEvents: eventsCount,
          totalStadiums: stadiumsCount,
          totalCategories: categoriesCount,
          totalBookings: bookingsCount,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardStats();
    }
  }, [currentUser]);

  const dashboardItems = [
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      count: dashboardStats.totalUsers,
      icon: <FaUsers className="dashboard-icon" />,
      link: "/Users",
      color: "#4CAF50",
    },
    {
      title: "Events",
      description: "Manage upcoming and past events",
      count: dashboardStats.totalEvents,
      icon: <FaCalendarAlt className="dashboard-icon" />,
      link: "/Events",
      color: "#2196F3",
    },
    {
      title: "Stadiums",
      description: "Manage stadium venues and details",
      count: dashboardStats.totalStadiums,
      icon: <FaBuilding className="dashboard-icon" />,
      link: "/Stadiums",
      color: "#FF9800",
    },
    {
      title: "Categories",
      description: "Manage seating categories and pricing",
      count: dashboardStats.totalCategories,
      icon: <FaLayerGroup className="dashboard-icon" />,
      link: "/admincategory",
      color: "#9C27B0",
    },
    {
      title: "Seats",
      description: "Manage seat arrangements and availability",
      count: dashboardStats.totalBookings,
      icon: <FaChair className="dashboard-icon" />,
      link: "/Seats",
      color: "#F44336",
    },
  ];

  return (
    <div className="admin-dash">
      <Adminnavbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's your administration overview.</p>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            {dashboardItems.map((item, index) => (
              <Link to={item.link} key={index} className="dashboard-card">
                <div
                  className="card-icon"
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon}
                </div>
                <div className="card-content">
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <div className="card-stats">
                    <span className="stats-number">{item.count}</span>
                    <span className="stats-label">
                      Total {item.title.toLowerCase()}
                    </span>
                  </div>
                </div>
                <div className="card-action">
                  <span>View Details</span>
                  <FaArrowRight />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDash;
