import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from "recharts";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState(""); // Tambah state role
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }

    const storedName = localStorage.getItem("name");
    if (storedName) {
      setName(storedName);
    }

    const storedRole = localStorage.getItem("role"); // Ambil role dari localStorage
    if (storedRole) {
      setRole(storedRole);
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const today = new Date();
    const pastYear = new Date(today);
    pastYear.setFullYear(today.getFullYear() - 1); // ubah ke 1 tahun ke belakang
    const formatDate = (d) => d.toISOString().split("T")[0];

    const filter = {
      startDate: formatDate(pastYear),
      endDate: formatDate(today),
    };

    try {
      // Line Chart - Shipping Fee dari Sales Order
      const lineRes = await axiosInstance.post("/api/dashboard/get-data", {
        entity: "sales_order",
        x: "salesDate",
        y: "totalPrice",
        aggregation: "sum",
        filter: filter,
      }, { headers });
      setLineData(lineRes.data.data.data || []);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  const pieColors = ["#FF8042", "#00C49F", "#8884D8", "#ffc658", "#8dd1e1"];

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h2>Home</h2>
        <button onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("name");
          localStorage.removeItem("role");
          navigate("/");
        }}>Logout</button>
      </nav>
      <div className="content">
        <h1 className="page-title" style={{ textAlign: "center", marginTop: "50px" }}>
          Welcome, {name}
        </h1>
        {/* Dashboard hanya tampil jika bukan kepala gudang */}
        {role !== "kepala_gudang" && (
          <div className="charts-section">
            <div className="chart-card">
              <h3>
                Sales Order Profit (
                {lineData.length > 0
                  ? new Date(lineData[0].x).getFullYear()
                  : new Date().getFullYear()}
                )
              </h3>
              {lineData.length === 0 ? (
                <div className="no-data">No data available</div>
              ) : (
                <LineChart width={350} height={250} data={lineData}>
                  <Line type="monotone" dataKey="y" stroke="#f7931e" strokeWidth={2} />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis
                    dataKey="x"
                    tickFormatter={(dateStr) => {
                      const date = new Date(dateStr);
                      return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;