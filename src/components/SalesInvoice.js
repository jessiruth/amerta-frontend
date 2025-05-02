import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Toolbar from "../components/ToolbarInvoice";
import "../styles/GudangList.css";

const SalesInvoice = () => {
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

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/api/sales-invoice/viewall", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data && Array.isArray(response.data.data)) {
                setData(response.data.data);
                setFilteredData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        const filtered = data.filter((item) => {
            if (searchCategory === "status") return item.invoiceStatus.toLowerCase().includes(lower);
            if (searchCategory === "amount") return item.totalAmount.toString().includes(searchTerm.replace(/[^0-9]/g, ""));
            if (searchCategory === "due") return item.dueDate.toLowerCase().includes(lower);
            if (searchCategory === "id") return item.id.toLowerCase().includes(lower);
            return (
                item.invoiceStatus.toLowerCase().includes(lower) ||
                item.totalAmount.toString().includes(searchTerm.replace(/[^0-9]/g, "")) ||
                item.dueDate.toLowerCase().includes(lower) ||
                item.id.toLowerCase().includes(lower)
            );
        });
        setFilteredData(filtered);
    }, [searchTerm, searchCategory, data]);

    const handleRefresh = () => {
        setSearchTerm("");
        setSearchCategory("all");
        setFilteredData(data);
        fetchData();
    };

    return (
        <div className="gudang-list-container">
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
                                <th>Sisa Bayar</th>
                                <th>Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.invoiceStatus}</td>
                                    <td>Rp{item.totalAmount.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                                    <td>{item.dueDate}</td>
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
                            )) : (
                                <tr><td colSpan="6" className="no-data">No data available</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SalesInvoice;
