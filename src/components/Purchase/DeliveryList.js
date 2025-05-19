import { useEffect, useState } from "react";
import ToolbarDelivery from "../../components/ToolbarDelivery";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GoodsTransport.css";

const DeliveryList = () => {
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
                    headers: { Authorization: `Bearer ${token}` },
                });

                const purchaseOrders = response.data?.data || [];

                const filtered = purchaseOrders.filter(order => order.delivery !== null);

                const withCustomer = await Promise.all(
                    filtered.map(async (order) => {
                        const customerName = await fetchCustomerName(order.customerId);
                        return {
                            id: order.id,
                            deliveryId: order.delivery.id,
                            customerName,
                            deliveryDate: order.delivery.deliveryDate,
                            trackingNumber: order.delivery.trackingNumber,
                            deliveryFee: order.delivery.deliveryFee,
                            deliveryStatus: order.delivery.deliveryStatus,
                        };
                    })
                );

                setData(withCustomer);
                setFilteredData(withCustomer);
            } catch (error) {
                console.error("Error fetching delivery data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    useEffect(() => {
        const filtered = data.filter((item) => {
            const lower = searchTerm.toLowerCase().trim();
            const numeric = parseFloat(searchTerm.replace(",", "."));

            if (!lower) return true;

            if (searchCategory === "id") {
            return item.deliveryId.toLowerCase() === lower;
            } else if (searchCategory === "vendor") {
            return item.customerName.toLowerCase() === lower;
            } else if (searchCategory === "status") {
            return item.deliveryStatus.toLowerCase() === lower;
            } else if (searchCategory === "date") {
            return item.deliveryDate.toLowerCase().includes(lower);
            } else if (searchCategory === "resi") {
            return item.trackingNumber.toLowerCase() === lower;
            } else if (searchCategory === "deliveryfee") {
            return !isNaN(numeric) && parseFloat(item.deliveryFee) === numeric;
            } else if (searchCategory === "all") {
            return (
                item.deliveryId.toLowerCase().includes(lower) ||
                item.customerName.toLowerCase().includes(lower) ||
                item.deliveryDate.toLowerCase().includes(lower) ||
                item.deliveryStatus.toLowerCase().includes(lower) ||
                item.trackingNumber.toLowerCase().includes(lower) ||
                item.deliveryFee?.toString().replace(".", ",").includes(searchTerm)
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
            <h1 className="page-title">Delivery Note</h1>

            <ToolbarDelivery
                onRefresh={handleRefresh}
                onFilter={(category) => setSearchCategory(category)}
                onSearch={(term) => setSearchTerm(term)}
                selectedCategory={searchCategory}
                searchTerm={searchTerm}
            />

            <div className="table-container">
                <div className="table-header">
                    <h2>Delivery</h2>
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
                                <th>Nama Vendor</th>
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
                                        <td>{item.deliveryId}</td>
                                        <td>{item.customerName}</td>
                                        <td>{item.deliveryDate}</td>
                                        <td>{item.trackingNumber}</td>
                                        <td>Rp{parseFloat(item.deliveryFee).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                                        <td>{item.deliveryStatus}</td>
                                        <td>
                                            <button
                                                className="detail-btn"
                                                onClick={() => navigate(`/delivery/detail/${item.id}`)}
                                            >
                                                Details
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

export default DeliveryList;