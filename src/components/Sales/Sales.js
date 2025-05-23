import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import ToolbarSalesOrder from "./ToolbarSalesOrder";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/GoodsTransport.css";

const Sales = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const toastShownRef = useRef(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/");
  }, [navigate, token]);

  useEffect(() => {
    const fetchData = async () => {
      const fetchCustomerName = async (id) => {
        try {
          const response = await axiosInstance.get(`/api/customer/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return response.data?.data?.name || "Unknown";
        } catch {
          return "Unknown";
        }
      };

      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/sales-order/viewall", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const salesOrders = response.data?.data || [];

        const dataWithCustomerNames = await Promise.all(
          salesOrders.map(async (order) => {
            const customerName = await fetchCustomerName(order.customerId);
            return { ...order, customerName };
          })
        );

        const today = new Date();
        const upcoming = dataWithCustomerNames.filter((item) => {
          const due = item.invoice?.dueDate ? new Date(item.invoice.dueDate) : null;
          if (!due) return false;
          const diff = (due - today) / (1000 * 60 * 60 * 24);
          return (item.status === "CONFIRMED" || item.status === "PARTIALLY_PAID") && diff <= 10;
        });

        if (upcoming.length > 0 && !toastShownRef.current) {
          toast.warn(`⚠ ${upcoming.length} tagihan sales jatuh tempo dalam ≤10 hari`, {
            autoClose: 4000,
          });
          toastShownRef.current = true;
        }

        setData(dataWithCustomerNames);
        setFilteredData(dataWithCustomerNames);
      } catch (error) {
        console.error("Error fetching sales orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    const lower = searchTerm.toLowerCase().trim();
    const parsed = parseFloat(lower.replace(",", "."));
    const today = new Date();

    const filtered = data.filter((item) => {
      if (!lower) return true;

      const dueDate = item.invoice?.dueDate ? new Date(item.invoice.dueDate) : null;
      const sisaHari = dueDate ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)) : null;

      if (searchCategory === "id") return item.id.toLowerCase() === lower;
      if (searchCategory === "customer") return item.customerName.toLowerCase() === lower;
      if (searchCategory === "status") return item.status.toLowerCase() === lower;
      if (searchCategory === "price") return !isNaN(parsed) && parseFloat(item.totalPrice) === parsed;
      if (searchCategory === "date") return item.salesDate.toLowerCase().includes(lower);
      if (searchCategory === "due date") return item.invoice?.dueDate?.toLowerCase().includes(lower);
      if (searchCategory === "payment terms") return (
        !isNaN(parsed) &&
        item.invoice &&
        (item.status !== "COMPLETED") &&
        sisaHari !== null &&
        sisaHari === Math.floor(parsed)
      );

      return (
        item.id.toLowerCase().includes(lower) ||
        item.customerName.toLowerCase().includes(lower) ||
        item.salesDate.toLowerCase().includes(lower) ||
        item.status.toLowerCase().includes(lower) ||
        item.totalPrice?.toString().replace(".", ",").includes(searchTerm) ||
        item.invoice?.dueDate?.toLowerCase().includes(lower) ||
        (sisaHari !== null && sisaHari.toString() === searchTerm)
      );
    });

    setFilteredData(filtered);
  }, [searchTerm, searchCategory, data]);

  const handleRefresh = () => {
    setSearchTerm("");
    setSearchCategory("all");
    toastShownRef.current = false;
    setFilteredData(data);
  };

  return (
    <div className="gudang-list-container">
      <ToastContainer />
      <h1 className="page-title">Sales</h1>

      <ToolbarSalesOrder
        onAdd={() => navigate("/sales-order/add")}
        onRefresh={handleRefresh}
        onFilter={(category) => setSearchCategory(category)}
        onSearch={(term) => setSearchTerm(term)}
        selectedCategory={searchCategory}
        searchTerm={searchTerm}
      />

      <div className="table-container">
        <div className="table-header">
          <h2>Sales</h2>
        </div>

        {loading ? (
          <div className="loading-container">
            <p>Loading...</p>
          </div>
        ) : (
          <table className="gudang-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Customer</th>
                <th>Tanggal</th>
                <th>Total Harga (Profit)</th>
                <th>Status</th>
                <th>Jatuh Tempo</th>
                <th>Sisa Hari</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((order) => {
                  const dueDate = order.invoice?.dueDate ? new Date(order.invoice.dueDate) : null;
                  const today = new Date();
                  const sisaHari = dueDate ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)) : "-";
                  const highlightRow = sisaHari !== "-" && sisaHari <= 10 && (order.status === "CONFIRMED" || order.status === "PARTIALLY_PAID");

                  return (
                    <tr key={order.id} className={highlightRow ? "row-red" : ""}>
                      <td>{order.id}</td>
                      <td>{order.customerName}</td>
                      <td>{order.salesDate}</td>
                      <td>Rp{parseFloat(order.totalPrice).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                      <td>{order.status}</td>
                      <td>{order.invoice?.dueDate || "-"}</td>
                      <td>
                        {(order.status !== "COMPLETED" && typeof sisaHari === "number")
                          ? sisaHari
                          : "-"}
                      </td>

                      <td>
                        <button
                          className="detail-btn"
                          onClick={() => navigate(`/sales/completed/detail/${order.id}`)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Sales;