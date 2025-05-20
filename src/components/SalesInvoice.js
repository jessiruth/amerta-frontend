import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Toolbar from "../components/ToolbarInvoice";
import "../styles/GudangList.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SalesInvoice = () => {
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/sales-invoice/viewall", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data.data)) {
        const list = response.data.data;

        // Toast warning untuk invoice yang akan jatuh tempo
        const today = new Date();
        const warningInvoices = list.filter((inv) => {
          if (inv.invoiceStatus === "PARTIALLY PAID" || inv.invoiceStatus === "ISSUED") {
            const due = new Date(inv.dueDate);
            const diff = (due - today) / (1000 * 60 * 60 * 24);
            return diff <= 10;
          }
          return false;
        });

        if (warningInvoices.length > 0 && !toastShownRef.current) {
          toast.warn(`⚠ Terdapat ${warningInvoices.length} invoice sales yang akan jatuh tempo ≤10 hari`, {
            autoClose: 4000,
          });
          toastShownRef.current = true;
        }

        setData(list);
        setFilteredData(list);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const lower = searchTerm.toLowerCase().trim();
    const numeric = parseFloat(searchTerm.replace(",", "."));
    const today = new Date();

    const filtered = data.filter((item) => {
      const dueDate = item.dueDate ? new Date(item.dueDate) : null;
      const daysLeft = dueDate ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)) : null;

      if (!lower) return true;

      if (searchCategory === "status") return item.invoiceStatus.toLowerCase() === lower;
      if (searchCategory === "amount") return !isNaN(numeric) && parseFloat(item.totalAmount) === numeric;
      if (searchCategory === "due") return item.dueDate.toLowerCase().includes(lower);
      if (searchCategory === "id") return item.id.toLowerCase() === lower;
      if (searchCategory === "payment terms") return !isNaN(numeric) && daysLeft === Math.floor(numeric) && item.invoiceStatus !== "PAID";
      if (searchCategory === "sisa") return !isNaN(numeric) && parseFloat(item.remainingAmount) === numeric;

      return (
        item.invoiceStatus.toLowerCase().includes(lower) ||
        item.totalAmount.toString().replace(".", ",").includes(searchTerm) ||
        item.remainingAmount.toString().replace(".", ",").includes(searchTerm) ||
        (daysLeft !== null && daysLeft.toString() === searchTerm) ||
        item.dueDate.toLowerCase().includes(lower) ||
        item.id.toLowerCase().includes(lower)
      );
    });

    setFilteredData(filtered);
  }, [searchTerm, searchCategory, data]);

  const handleRefresh = () => {
    setSearchTerm("");
    setSearchCategory("all");
    toastShownRef.current = false;
    setFilteredData(data);
    fetchData();
  };

  const getDueStatus = (dueDateStr, status) => {
    if (status !== "PARTIALLY PAID" && status !== "ISSUED") return { isDue: false, daysLeft: "-" };
    const today = new Date();
    const due = new Date(dueDateStr);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return {
      isDue: diffDays <= 10,
      daysLeft: diffDays >= 0 ? diffDays : 0,
    };
  };

  return (
    <div className="gudang-list-container">
      <ToastContainer />
      <h1 className="page-title">Sales Invoice</h1>

      <Toolbar
        onRefresh={handleRefresh}
        onFilter={(category) => setSearchCategory(category)}
        onSearch={(term) => setSearchTerm(term)}
        selectedCategory={searchCategory}
        searchTerm={searchTerm}
      />

      <div className="table-container">
        <div className="table-header"><h2>Sales Invoice Table</h2></div>
        {loading ? (
          <div className="loading-container"><p>Loading...</p></div>
        ) : (
          <table className="gudang-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Jumlah</th>
                <th>Jatuh Tempo</th>
                <th>Sisa Hari</th>
                <th>Sisa Bayar</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((item) => {
                const { isDue, daysLeft } = getDueStatus(item.dueDate, item.invoiceStatus);
                return (
                  <tr key={item.id} className={isDue ? "row-red" : ""}>
                    <td>{item.id}</td>
                    <td>{item.invoiceStatus}</td>
                    <td>Rp{item.totalAmount.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                    <td>{item.dueDate}</td>
                    <td>{daysLeft}</td>
                    <td>Rp{item.remainingAmount.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                    <td>
                      <button
                        className="detail-btn"
                        onClick={() => navigate(`/sales-invoice/detail/${item.salesOrderId}`)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="7" className="no-data">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SalesInvoice;
