import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import ToolbarSalesOrder from "./ToolbarSales";
import "../../styles/GoodsTransport.css";

const SalesOrder = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchCategory, setSearchCategory] = useState("all");
    const [loading, setLoading] = useState(true);

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

        const filtered = data.filter((item) => {
        if (!lower) return true;

        if (searchCategory === "id") {
            return item.id.toString().toLowerCase() === lower;
        }
        if (searchCategory === "customer") {
            return item.customerName.toLowerCase() === lower;
        }
        if (searchCategory === "status") {
            return item.status.toLowerCase() === lower;
        }
        if (searchCategory === "price") {
            return !isNaN(parsed) && parseFloat(item.totalPrice) === parsed;
        }
        if (searchCategory === "date") {
            return item.salesDate.toLowerCase().includes(lower);
        }
        return (
            item.id.toString().toLowerCase().includes(lower) ||
            item.customerName.toLowerCase().includes(lower) ||
            item.salesDate.toLowerCase().includes(lower) ||
            item.status.toLowerCase().includes(lower) ||
            item.totalPrice?.toString().replace(".", ",").includes(searchTerm)
        );
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
            <h1 className="page-title">Sales Order</h1>

            <ToolbarSalesOrder
                onRefresh={handleRefresh}
                onFilter={(category) => setSearchCategory(category)}
                onSearch={(term) => setSearchTerm(term)}
                selectedCategory={searchCategory}
                searchTerm={searchTerm}
            />

            <div className="table-container">
                <div className="table-header">
                    <h2>Sales Order</h2>
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
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((order) => (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        <td>{order.customerName}</td>
                                        <td>{order.salesDate}</td>
                                        <td>Rp{parseFloat(order.totalPrice).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                                        <td>{order.status}</td>
                                        <td>
                                            <button
                                                className="detail-btn"
                                                onClick={() => navigate(`/sales-order/detail/${order.id}`)}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-data">Tidak ada data</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SalesOrder;
