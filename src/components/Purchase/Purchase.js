import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import Toolbar from "../Purchase/ToolbarPurchase";
import "../../styles/GoodsTransport.css";

const Purchase = () => {
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
            const response = await axiosInstance.get("/api/purchase-order/viewall", {
              params: { status: "COMPLETED" },
              headers: { Authorization: `Bearer ${token}` },
            });
      
            const purchaseOrders = response.data?.data || [];
      
            const dataWithCustomerNames = await Promise.all(
              purchaseOrders.map(async (order) => {
                const customerName = await fetchCustomerName(order.customerId);
                return { ...order, customerName };
              })
            );
      
            setData(dataWithCustomerNames);
            setFilteredData(dataWithCustomerNames);
          } catch (error) {
            console.error("Error fetching purchase:", error);
          } finally {
            setLoading(false);
          }
        };
      
        fetchData();
      }, [token]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        const filtered = data.filter((item) => {
            if (searchCategory === "id") {
                return item.id.toString().toLowerCase().includes(lower);
            } else if (searchCategory === "customer") {
                return item.customerName.toLowerCase().includes(lower);
            } else if (searchCategory === "date") {
                return item.purchaseDate.toLowerCase().includes(lower);
            } else if (searchCategory === "price") {
                return item.totalPrice.toString().toLowerCase().includes(lower);
            } else {
                return (
                    item.id.toString().toLowerCase().includes(lower) ||
                    item.customerName.toLowerCase().includes(lower) ||
                    item.purchaseDate.toLowerCase().includes(lower) ||
                    item.totalPrice.toString().toLowerCase().includes(lower)
                );
            }
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
            <h1 className="page-title">Purchase</h1>

            <Toolbar
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
                                <th>Tanggal</th>
                                <th>Total Harga</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((order) => (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        <td>{order.customerName}</td>
                                        <td>{order.purchaseDate}</td>
                                        <td>Rp {parseFloat(order.totalPrice).toLocaleString("id-ID")}</td>
                                        <td>
                                            <button
                                                className="detail-btn"
                                                onClick={() => navigate(`/purchase-order/detail/${order.id}`)}
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data">Tidak ada data</td>
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