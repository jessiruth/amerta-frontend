import { useEffect, useState } from "react";
import ToolbarShipping from "../../components/ToolbarShipping";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GoodsTransport.css";

const ShippingList = () => {
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

                const filtered = salesOrders.filter(order => order.shipping !== null);

                const withCustomer = await Promise.all(
                    filtered.map(async (order) => {
                        const customerName = await fetchCustomerName(order.customerId);
                        return {
                            id: order.id,
                            customerName,
                            deliveryDate: order.shipping.deliveryDate,
                            trackingNumber: order.shipping.trackingNumber,
                            deliveryFee: order.shipping.deliveryFee,
                            deliveryStatus: order.shipping.deliveryStatus,
                        };
                    })
                );

                setData(withCustomer);
                setFilteredData(withCustomer);
            } catch (error) {
                console.error("Error fetching shipping data:", error);
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
            } else if (searchCategory === "customer") {
                return item.customerName.toLowerCase().includes(lower);
            } else if (searchCategory === "status") {
                return item.deliveryStatus.toLowerCase().includes(lower);
            } else if (searchCategory === "date") {
                return item.deliveryDate.toLowerCase().includes(lower);
            } else {
                return (
                    item.id.toLowerCase().includes(lower) ||
                    item.customerName.toLowerCase().includes(lower) ||
                    item.deliveryDate.toLowerCase().includes(lower) ||
                    item.deliveryStatus.toLowerCase().includes(lower)
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
            <h1 className="page-title">Daftar Pengiriman</h1>

            <ToolbarShipping
                onRefresh={handleRefresh}
                onFilter={(category) => setSearchCategory(category)}
                onSearch={(term) => setSearchTerm(term)}
                selectedCategory={searchCategory}
                searchTerm={searchTerm}
            />

            <div className="table-container">
                <div className="table-header">
                    <h2>Shipping Table</h2>
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
                                <th>Tanggal Pengiriman</th>
                                <th>Nomor Resi</th>
                                <th>Biaya Kirim</th>
                                <th>Status</th>
                                <th>Surat Jalan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.customerName}</td>
                                        <td>{item.deliveryDate}</td>
                                        <td>{item.trackingNumber}</td>
                                        <td>Rp {parseFloat(item.deliveryFee).toLocaleString("id-ID")}</td>
                                        <td>{item.deliveryStatus}</td>
                                        <td>
                                            <button
                                                className="detail-btn"
                                                onClick={() => navigate(`/shipping/detail/${item.id}`)}
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-data">Tidak ada data pengiriman</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ShippingList;
