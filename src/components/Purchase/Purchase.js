import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GoodsTransport.css";
import ToolbarPurchaseOrder from "./ToolbarPurchaseOrder";
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
                        const vendorName = await fetchVendorName(po.customerId); // assuming customerId is vendor
                        return { ...po, vendorName };
                    })
                );

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
        const lower = searchTerm.toLowerCase();
        const filtered = data.filter((item) => {
            if (searchCategory === "id") {
                return item.id.toLowerCase().includes(lower);
            } else if (searchCategory === "vendor") {
                return item.vendorName.toLowerCase().includes(lower);
            } else if (searchCategory === "date") {
                return item.purchaseDate.toLowerCase().includes(lower);
            } else if (searchCategory === "price") {
                return item.totalPrice.toString().toLowerCase().includes(lower);
            } else if (searchCategory === "status") {
                return item.status.toLowerCase().includes(lower);
            } else {
                return (
                    item.id.toLowerCase().includes(lower) ||
                    item.vendorName.toLowerCase().includes(lower) ||
                    item.purchaseDate.toLowerCase().includes(lower) ||
                    item.totalPrice.toString().toLowerCase().includes(lower) ||
                    item.status.toLowerCase().includes(lower)
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

            <ToolbarPurchaseOrder
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
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((po) => (
                                    <tr key={po.id}>
                                        <td>{po.id}</td>
                                        <td>{po.vendorName}</td>
                                        <td>{po.purchaseDate}</td>
                                        <td>Rp{parseFloat(po.totalPrice).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                                        <td>{po.status}</td>
                                        <td>
                                            <button
                                                className="detail-btn"
                                                onClick={() => navigate(`/purchase/completed/detail/${po.id}`)}
                                            >
                                                Detail
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

export default Purchase;