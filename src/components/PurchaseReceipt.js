import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Toolbar from "../components/ToolbarPurchaseReceipt";
import "../styles/GoodsTransport.css";

const PurchaseReceipt = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [navigate, token]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/purchase-receipt/viewall", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.data) {
        setData(response.data.data);
        setFilteredData(response.data.data);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase().trim();
        const numeric = parseFloat(searchTerm.replace(",", "."));

        const filtered = data.filter((item) => {
            if (!lower) return true;

            if (searchCategory === "id") {
            return item.id.toString().toLowerCase() === lower;
            } else if (searchCategory === "date") {
            return item.receiptDate.toLowerCase().includes(lower);
            } else if (searchCategory === "amount") {
            return !isNaN(numeric) && parseFloat(item.amountPayed) === numeric;
            } else if (searchCategory === "all") {
            return (
                item.id.toString().toLowerCase().includes(lower) ||
                item.receiptDate.toLowerCase().includes(lower) ||
                item.amountPayed.toString().replace(".", ",").includes(searchTerm)
            );
            }

            return false;
        });

        setFilteredData(filtered);
    }, [searchTerm, searchCategory, data]);


  const handleRefresh = () => {
    setSearchTerm("");
    setSearchCategory("all");
    setFilteredData(data);
  };

  return (
    <div className="gudang-list-container">
      <h1 className="page-title">Purchase Receipt</h1>

      <Toolbar
        onRefresh={handleRefresh}
        onFilter={(category) => setSearchCategory(category)}
        onSearch={(term) => setSearchTerm(term)}
        selectedCategory={searchCategory}
        searchTerm={searchTerm}
      />

      <div className="table-container">
        <div className="table-header">
          <h2>Purchase Receipt</h2>
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
                <th>Receipt Date</th>
                <th>Amount</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.receiptDate}</td>
                    <td>
                      Rp{parseFloat(item.amountPayed).toLocaleString("id-ID", { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <button
                        className="detail-btn"
                        onClick={() => navigate(`/purchase-receipt/detail/${item.purchaseOrderId}`)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PurchaseReceipt;
