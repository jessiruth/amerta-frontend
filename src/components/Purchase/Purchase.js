import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GoodsTransport.css";
import ToolbarPurchase from "./ToolbarPurchase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Purchase = () => {
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
      const fetchVendorName = async (id) => {
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
        const response = await axiosInstance.get("/api/purchase-order/viewall", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const purchaseOrders = response.data?.data || [];

        const dataWithVendorNames = await Promise.all(
          purchaseOrders.map(async (po) => {
            const vendorName = await fetchVendorName(po.customerId);
            return { ...po, vendorName };
          })
        );

        // hitung invoice due dalam ≤10 hari
        const today = new Date();
        const dueSoon = dataWithVendorNames.filter((po) => {
          const dueDate = po.invoice?.dueDate;
          const status = po.status;
          if (dueDate && (status === "CONFIRMED" || status === "PARTIALLY_PAID")) {
            const diff = (new Date(dueDate) - today) / (1000 * 60 * 60 * 24);
            return diff <= 10;
          }
          return false;
        });

        if (dueSoon.length > 0 && !toastShownRef.current) {
          toast.warn(`⚠ ${dueSoon.length} tagihan jatuh tempo dalam ≤10 hari`, {
            autoClose: 4000,
          });
          toastShownRef.current = true;
        }

        setData(dataWithVendorNames);
        setFilteredData(dataWithVendorNames);
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
  const lower = searchTerm.toLowerCase().trim();
  const numeric = parseFloat(searchTerm.replace(",", "."));

  const today = new Date();

  const filtered = data.filter((item) => {
        if (!lower) return true;

        const dueDate = item.invoice?.dueDate ? new Date(item.invoice.dueDate) : null;
        const sisaHari = dueDate ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)) : null;

        if (searchCategory === "id") {
        return item.id.toLowerCase() === lower;

        } else if (searchCategory === "vendor") {
        return item.vendorName.toLowerCase() === lower;

        } else if (searchCategory === "date") {
        return item.purchaseDate.toLowerCase().includes(lower);

        } else if (searchCategory === "price") {
        return !isNaN(numeric) && parseFloat(item.totalPrice) === numeric;

        } else if (searchCategory === "status") {
        return item.status.toLowerCase() === lower;

        } else if (searchCategory === "due date") {
        return item.invoice?.dueDate?.toLowerCase().includes(lower);

        } else if (searchCategory === "payment terms") {
        return (
            !isNaN(numeric) &&
            item.invoice &&
            (item.status === "CONFIRMED") &&
            sisaHari !== null &&
            sisaHari === Math.floor(numeric)
        );

        } else if (searchCategory === "all") {
        return (
            item.id.toLowerCase().includes(lower) ||
            item.vendorName.toLowerCase().includes(lower) ||
            item.purchaseDate.toLowerCase().includes(lower) ||
            item.status.toLowerCase().includes(lower) ||
            (item.invoice?.dueDate?.toLowerCase().includes(lower)) ||
            (!isNaN(numeric) && (
            item.totalPrice.toString().replace(".", ",").includes(searchTerm) ||
            item.invoice?.paymentTerms?.toString().includes(searchTerm) ||
            (sisaHari !== null && sisaHari.toString() === searchTerm)
            ))
        );
        }

        return false;
    });

    setFilteredData(filtered);
    }, [searchTerm, searchCategory, data]);



  const handleRefresh = () => {
    setSearchTerm("");
    setSearchCategory("all");
    toastShownRef.current = false;
    setFilteredData(data);
  };

  const getDueInfo = (dueDate, status) => {
    if (!dueDate || status !== "CONFIRMED") {
      return { daysLeft: "-", isSoon: false };
    }
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return { daysLeft: diff >= 0 ? diff : 0, isSoon: diff <= 10 };
  };

  return (
    <div className="gudang-list-container">
      <ToastContainer />
      <h1 className="page-title">Purchase</h1>

      <ToolbarPurchase
        onAdd={() => navigate("/purchase-order/add")}
        onRefresh={handleRefresh}
        onFilter={(category) => setSearchCategory(category)}
        onSearch={(term) => setSearchTerm(term)}
        selectedCategory={searchCategory}
        searchTerm={searchTerm}
      />

      <div className="table-container">
        <div className="table-header">
          <h2>Purchase</h2>
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
                <th>Vendor</th>
                <th>Tanggal Beli</th>
                <th>Total Harga</th>
                <th>Status</th>
                <th>Jatuh Tempo</th>
                <th>Sisa Hari</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((po) => {
                  const dueDate = po.invoice?.dueDate;
                  const { daysLeft, isSoon } = getDueInfo(dueDate, po.status);

                  return (
                    <tr key={po.id} className={isSoon ? "row-red" : ""}>
                      <td>{po.id}</td>
                      <td>{po.vendorName}</td>
                      <td>{po.purchaseDate}</td>
                      <td>
                        Rp{parseFloat(po.totalPrice).toLocaleString("id-ID", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>{po.status}</td>
                      <td>{dueDate || "-"}</td>
                      <td>{daysLeft}</td>
                      <td>
                        <button
                          className="detail-btn"
                          onClick={() => navigate(`/purchase/completed/detail/${po.id}`)}
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

export default Purchase;
