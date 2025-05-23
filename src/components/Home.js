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
  const [role, setRole] = useState("");
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
   const [expenseData, setExpenseData] = useState([]);
   const [barangStatusData, setBarangStatusData] = useState([]);

  const [summary, setSummary] = useState({
    barangAktif: 0,
    totalCustomer: 0,
    totalSupplier: 0,
    salesOrderBulanIni: 0,
    purchaseOrderBulanIni: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }

    const storedName = localStorage.getItem("name");
    const storedRole = localStorage.getItem("role");
    if (storedName) setName(storedName);
    if (storedRole) setRole(storedRole);

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const today = new Date();
    const pastYear = new Date(today);
    pastYear.setFullYear(today.getFullYear() - 1);
    const formatDate = (d) => d.toISOString().split("T")[0];
    const filter = {
      startDate: formatDate(pastYear),
      endDate: formatDate(today)
    };

    try {
      const [sales, purchase] = await Promise.all([
        axiosInstance.post("/api/dashboard/get-data", {
          entity: "sales_order", x: "salesDate", y: "id", aggregation: "count", filter
        }, { headers }),
        axiosInstance.post("/api/dashboard/get-data", {
          entity: "purchase_order", x: "purchaseDate", y: "id", aggregation: "count", filter
        }, { headers })
      ]);
      const mergedBar = sales.data.data.data.map((d, i) => ({
        x: d.x,
        sales: d.y,
        purchase: purchase.data.data.data[i]?.y || 0
      }));
      setBarData(mergedBar);

      // Line Chart - Sales Order Profit (original)
      const lineRes = await axiosInstance.post("/api/dashboard/get-data", {
        entity: "sales_order",
        x: "salesDate",
        y: "totalPrice",
        aggregation: "sum",
        filter
      }, { headers });
      setLineData(lineRes.data.data.data || []);

      const futureDate = new Date(today);
      futureDate.setFullYear(today.getFullYear() + 1);

      const purchaseOrderFilter = {
        startDate: formatDate(today),
        endDate: formatDate(futureDate)
      };

      const expenseRes = await axiosInstance.post("/api/dashboard/get-data", {
        entity: "purchase_order",
        x: "purchaseDate",
        y: "totalPrice",
        aggregation: "sum",
        filter: purchaseOrderFilter
      }, { headers });

      setExpenseData(expenseRes.data.data.data || []);
  
      // Hitung summary data dari API
      const [
        barangRes,
        customerRes,
        salesRes,
        purchaseRes
      ] = await Promise.all([
        axiosInstance.get("/api/barang/viewall", { headers }),
        axiosInstance.get("/api/customer/viewall", { headers }),
        axiosInstance.get("/api/sales-order/viewall", { headers }),
        axiosInstance.get("/api/purchase-order/viewall", { headers }),
      ]);

      const activeItems = barangRes.data.data.filter((b) => b.active).length;
      const inactiveItems = barangRes.data.data.filter((b) => !b.active).length;
      setBarangStatusData([
        { name: "Aktif", value: activeItems },
        { name: "Non-Aktif", value: inactiveItems }
      ]);

      const customers = customerRes.data.data.filter((c) => c.role === "CUSTOMER").length;
      const vendors = customerRes.data.data.filter((c) => c.role === "VENDOR").length;

      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();

      const countByMonth = (list, dateKey) =>
        list.filter((item) => {
          const d = new Date(item[dateKey]);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;

      const soThisMonth = countByMonth(salesRes.data.data, "salesDate");
      const poThisMonth = countByMonth(purchaseRes.data.data, "purchaseDate");

      setSummary({
        barangAktif: activeItems,
        totalCustomer: customers,
        totalSupplier: vendors,
        salesOrderBulanIni: soThisMonth,
        purchaseOrderBulanIni: poThisMonth
      });


    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h2>Home</h2>
        <button onClick={() => {
          localStorage.clear();
          navigate("/");
        }}>Logout</button>
      </nav>
      <div className="content">
        <h1 className="home-page-title">Welcome, {name}</h1>

        {role !== "kepala_gudang" && (
          <>
            <div className="summary-boxes">
              <div className="summary-box">Customer: {summary.totalCustomer}</div>
              <div className="summary-box">Vendor: {summary.totalSupplier}</div>
              <div className="summary-box">SO Bulan Ini: {summary.salesOrderBulanIni}</div>
              <div className="summary-box">PO Bulan Ini: {summary.purchaseOrderBulanIni}</div>
            </div>

            <div className="charts-section">
              <div className="chart-card">
                <h3>Penjualan vs Pembelian</h3>
                <BarChart width={350} height={250} data={barData}>
                  <Bar dataKey="sales" fill="#f7931e" />
                  <Bar dataKey="purchase" fill="#8884d8" />
                  <XAxis
                    dataKey="x"
                    tickFormatter={(dateStr) => {
                      const date = new Date(dateStr);
                      return date.toLocaleString("default", { month: "short" });
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend /> 
                </BarChart>
              </div>

              <div className="chart-card">
                <h3>Status Barang (Aktif vs Non-Aktif)</h3>
                <PieChart width={350} height={250}>
                  <Pie
                    data={barangStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    labelLine={false}
                  >
                    {barangStatusData.map((_, i) => (
                      <Cell key={i} fill={["#00C49F", "#FF8042"][i % 2]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                  <text
                    x={175}
                    y={117}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: "20px", fontWeight: "bold" }}
                  >
                    {barangStatusData.reduce((acc, cur) => acc + cur.value, 0)}
                  </text>
                </PieChart>
              </div>

              <div className="chart-card">
              <h3>Pengeluaran Pembelian ({new Date().getFullYear()})</h3>
              {expenseData.length === 0 ? (
                <div className="no-data">No data available</div>
              ) : (
                <LineChart width={350} height={250} data={expenseData}>
                  <Line type="monotone" dataKey="y" stroke="#8884d8" strokeWidth={2} />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis
                    dataKey="x"
                    tickFormatter={(dateStr) => {
                      const date = new Date(dateStr);
                      return date.toLocaleString("default", { month: "short" });
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              )}
            </div>

              <div className="chart-card">
                <h3>Profit Penjualan ({new Date().getFullYear()})</h3>
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
                        return date.toLocaleString("default", { month: "short" });
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                  </LineChart>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
