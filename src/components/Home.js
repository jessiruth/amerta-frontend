import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area
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
  const [incomeExpenseData, setIncomeExpenseData] = useState([]);
  const [shippingScatterData, setShippingScatterData] = useState([]);
  const [recentPO, setRecentPO] = useState([]);
  const [recentSO, setRecentSO] = useState([]);
  const [gudangList, setGudangList] = useState([]);

  const [summary, setSummary] = useState({
    barangAktif: 0,
    totalCustomer: 0,
    totalSupplier: 0,
    totalGudang: 0,
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
  }, [navigate]);

  useEffect(() => {
    if (role) {
      fetchDashboardData();

      if (role !== "sales") {
        fetchGudangData();
      }
    }
  }, [role]);

  const fetchGudangData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const gudangRes = await axiosInstance.get("/api/gudang/", { headers });
      const totalGudang = gudangRes.data?.data?.length || 0;
      setGudangList(gudangRes.data?.data || []);
      setSummary(prev => ({ ...prev, totalGudang: totalGudang}));
    } catch (err) {
      console.error("Gagal memuat data gudang:", err);
    }
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const year = new Date().getFullYear();
    const filter = {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`
    };

    const filterStatus = {
      statusList: ['COMPLETED'],
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`
    };

    try {
      // Bar Chart: Penjualan vs Pembelian
      const [sales, purchase] = await Promise.all([
        axiosInstance.post("/api/dashboard/get-data", {
          entity: "sales_order", x: "salesDate", y: "id", aggregation: "count", filter: filterStatus
        }, { headers }),
        axiosInstance.post("/api/dashboard/get-data", {
          entity: "purchase_order", x: "purchaseDate", y: "id", aggregation: "count", filter: filterStatus
        }, { headers })
      ]);

      // Area Chart
      const mergedBar = sales.data.data.data.map((d, i) => ({
        x: d.x,
        sales: d.y,
        purchase: purchase.data.data.data[i]?.y || 0
      }));
      setBarData(mergedBar);

      // Line Chart: Profit Penjualan
      const lineRes = await axiosInstance.post("/api/dashboard/get-data", {
        entity: "sales_order", x: "salesDate", y: "totalPrice", aggregation: "sum", filter: filterStatus
      }, { headers });
      setLineData(lineRes.data.data.data || []);

      // Line Chart: Pengeluaran PO
      const expenseRes = await axiosInstance.post("/api/dashboard/get-data", {
        entity: "purchase_order", x: "purchaseDate", y: "totalPrice", aggregation: "sum", filter:  filterStatus
      }, { headers });
      setExpenseData(expenseRes.data.data.data || []);

      // Scatter Plot - Rata-rata Shipping Fee per Bulan
      const shippingAvgRes = await axiosInstance.post("/api/dashboard/get-data", {
        entity: "sales_order",
        x: "salesDate",
        y: "shipping.shippingFee",
        aggregation: "avg",
        filter:  filter
      }, { headers });
      setShippingScatterData(shippingAvgRes.data.data.data || []);

      // Area Chart: Pengeluaran Aktual VS Pendapatan
      const incomeRes = await axiosInstance.post("/api/dashboard/get-data", {
        entity: "sales_payment",
        x: "paymentDate",
        y: "totalAmountPayed",
        aggregation: "sum",
        filter: filter
      }, { headers });

      const expensePORes = await axiosInstance.post("/api/dashboard/get-data", {
        entity: "purchase_payment",
        x: "paymentDate",
        y: "totalAmountPayed",
        aggregation: "sum",
        filter: filter
      }, { headers });

      // Gabungkan berdasarkan tanggal
      const incomeMap = new Map(incomeRes.data.data.data.map(d => [d.x, d.y]));
      const expenseMap = new Map(expensePORes.data.data.data.map(d => [d.x, d.y]));
      const allDates = new Set([...incomeMap.keys(), ...expenseMap.keys()]);
      const mergedData = Array.from(allDates).map(date => ({
        x: date,
        income: incomeMap.get(date) || 0,
        expense: expenseMap.get(date) || 0
      }));
      mergedData.sort((a, b) => new Date(a.x) - new Date(b.x));
      setIncomeExpenseData(mergedData);

      const [barangRes, customerRes, salesRes, purchaseRes] = await Promise.all([
        axiosInstance.get("/api/barang/viewall", { headers }),
        axiosInstance.get("/api/customer/viewall", { headers }),
        axiosInstance.get("/api/sales-order/viewall", { headers }),
        axiosInstance.get("/api/purchase-order/viewall", { headers })
      ]);

      const activeItems = barangRes.data.data.filter((b) => b.active).length;
      const inactiveItems = barangRes.data.data.filter((b) => !b.active).length;
      setBarangStatusData([
        { name: "Aktif", value: activeItems || 0 },
        { name: "Non-Aktif", value: inactiveItems || 0 }
      ]);

      const customers = customerRes.data.data.filter((c) => c.role === "CUSTOMER").length || 0;
      const vendors = customerRes.data.data.filter((c) => c.role === "VENDOR").length || 0;

      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();

      const countByMonth = (list, dateKey) =>
        (list && list.length > 0)
          ? list.filter((item) => {
            const d = new Date(item[dateKey]);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
          }).length
          : 0;

      const soThisMonth = countByMonth(salesRes.data.data, "salesDate") || 0;
      const poThisMonth = countByMonth(purchaseRes.data.data, "purchaseDate") || 0;

      setSummary(prev => ({
        ...prev,
        barangAktif: activeItems,
        totalCustomer: customers,
        totalSupplier: vendors,
        salesOrderBulanIni: soThisMonth,
        purchaseOrderBulanIni: poThisMonth
      }));

      // Fetch nama vendor untuk setiap PO
      const poWithVendor = await Promise.all(purchaseRes.data.data.map(async (po) => {
        try {
          const vendorRes = await axiosInstance.get(`/api/customer/${po.customerId}`, { headers });
          return { ...po, vendorName: vendorRes.data?.data?.name || "Unknown" };
        } catch {
          return { ...po, vendorName: "Unknown" };
        }
      }));

      // Fetch nama customer untuk setiap SO
      const soWithCustomer = await Promise.all(salesRes.data.data.map(async (so) => {
        try {
          const customerRes = await axiosInstance.get(`/api/customer/${so.customerId}`, { headers });
          return { ...so, customerName: customerRes.data?.data?.name || "Unknown" };
        } catch {
          return { ...so, customerName: "Unknown" };
        }
      }));

      setRecentPO(poWithVendor.reverse().slice(0, 5));
      setRecentSO(soWithCustomer.reverse().slice(0, 5));

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
              <div className="summary-box">
                <div className="summary-box-title">Customer</div>
                <div className="summary-box-value">{summary.totalCustomer}</div>
              </div>
              <div className="summary-box">
                <div className="summary-box-title">Vendor</div>
                <div className="summary-box-value">{summary.totalSupplier}</div>
              </div>
              <div className="summary-box">
                <div className="summary-box-title">SO Bulan Ini</div>
                <div className="summary-box-value">{summary.salesOrderBulanIni}</div>
              </div>
              <div className="summary-box">
                <div className="summary-box-title">PO Bulan Ini</div>
                <div className="summary-box-value">{summary.purchaseOrderBulanIni}</div>
              </div>
                {role !== "sales" && (
                  <div className="summary-box">
                    <div className="summary-box-title">Gudang</div>
                    <div className="summary-box-value">{summary.totalGudang}</div>
                  </div>
                )}
            </div>


            <div className="charts-section">
              <div className="chart-card">
                <h3>Penjualan vs Pembelian ({new Date().getFullYear()})</h3>
                {barData.length === 0 ? (
                  <div className="no-data">No data available</div>
                ) : (
                  <BarChart width={350} height={250} data={barData}>
                    <Bar dataKey="sales" fill="#f7931e" />
                    <Bar dataKey="purchase" fill="#8884d8" />
                    <XAxis dataKey="x" tickFormatter={(dateStr) => {
                      const date = new Date(dateStr);
                      return date.toLocaleString("default", { month: "short" });
                    }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                  </BarChart>
                )}
              </div>

              <div className="chart-card">
                <h3>Pendapatan vs Pengeluaran ({new Date().getFullYear()})</h3>
                {incomeExpenseData.length === 0 ? (
                  <div className="no-data">No data available</div>
                ) : (
                  <AreaChart width={350} height={250} data={incomeExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" tickFormatter={(dateStr) => {
                      const date = new Date(dateStr);
                      return date.toLocaleString("default", { month: "short" });
                    }} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="income" stroke="#00C49F" fill="#b2f2bb" />
                    <Area type="monotone" dataKey="expense" stroke="#FF8042" fill="#ffd8a8" />
                    <Legend />
                  </AreaChart>
                )}
              </div>

              <div className="chart-card">
                <h3>Status Barang (Aktif vs Non-Aktif)</h3>
                {barangStatusData.length === 0 ? (
                  <div className="no-data">No data available</div>
                ) : (
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
                )}
              </div>

              <div className="chart-card">
                <h3>Pengeluaran Pembelian ({new Date().getFullYear()})</h3>
                {expenseData.length === 0 ? (
                  <div className="no-data">No data available</div>
                ) : (
                  <LineChart width={350} height={250} data={expenseData}>
                    <Line type="monotone" dataKey="y" stroke="#8884d8" strokeWidth={2} />
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="x" tickFormatter={(dateStr) => {
                      const date = new Date(dateStr);
                      return date.toLocaleString("default", { month: "short" });
                    }} />
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
                    <XAxis dataKey="x" tickFormatter={(dateStr) => {
                      const date = new Date(dateStr);
                      return date.toLocaleString("default", { month: "short" });
                    }} />
                    <YAxis />
                    <Tooltip />
                  </LineChart>
                )}
              </div>

              <div className="chart-card">
                <h3>Rata-Rata Shipping Fee Sales ({new Date().getFullYear()})</h3>
                {shippingScatterData.length === 0 ? (
                  <div className="no-data">No data available</div>
                ) : (
                  <LineChart width={350} height={250} data={shippingScatterData}>
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
                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke="#82ca9d"
                      dot={{ stroke: "#82ca9d", strokeWidth: 2, r: 5, fill: "#ffffff" }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                )}
              </div>

            </div>

            <div className="dashboard-table-section">
              <div className="dashboard-table-card">
                <h3>Purchase Orders Terbaru</h3>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Vendor</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPO.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center" }}>No data available</td>
                      </tr>
                    ) : (
                      recentPO.map((po, idx) => (
                        <tr key={idx}>
                          <td>{po.id}</td>
                          <td>{po.vendorName}</td>
                          <td>Rp{parseFloat(po.totalPrice).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                          <td><span className={`dashboard-status-badge ${po.status.toLowerCase().replace(/ /g, "-")}`}>{po.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="dashboard-table-card">
                <h3>Sales Orders Terbaru</h3>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSO.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center" }}>No data available</td>
                      </tr>
                    ) : (
                      recentSO.map((so, idx) => (
                        <tr key={idx}>
                          <td>{so.id}</td>
                          <td>{so.customerName}</td>
                          <td>Rp{parseFloat(so.totalPrice).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                          <td><span className={`dashboard-status-badge ${so.status.toLowerCase().replace(/ /g, "-")}`}>{so.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
       {role !== "sales" && (
          <div className="dashboard-table-section">
            <div className="dashboard-table-card">
              <h3>Daftar Gudang</h3>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Kota, Provinsi</th>
                    <th>Kapasitas</th>
                  </tr>
                </thead>
                <tbody>
                  {gudangList.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center" }}>No data available</td>
                    </tr>
                  ) : (
                    gudangList.slice(-5).reverse().map((gudang, idx) => (
                      <tr key={idx}>
                        <td>{gudang.nama}</td>
                        <td>
                          {gudang.alamatGudang?.kota && gudang.alamatGudang?.provinsi
                            ? `${gudang.alamatGudang.kota}, ${gudang.alamatGudang.provinsi}`
                            : gudang.alamatGudang?.kota || "-"}
                        </td>
                        <td>{parseFloat(gudang.kapasitas).toLocaleString("id-ID")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;