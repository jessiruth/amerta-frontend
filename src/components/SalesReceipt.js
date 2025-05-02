import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Toolbar from "../components/ToolbarSalesReceipt";
import "../styles/GoodsTransport.css";

const SalesReceipt = () => {
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
                const response = await axiosInstance.get("/api/sales-receipt/viewall", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
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
        const lower = searchTerm.toLowerCase();

        if (searchTerm === "") {
            setFilteredData(data);
            return;
        }

        const filtered = data.filter((item) => {
            if (searchCategory === "id") {
                return item.id.toString().toLowerCase().includes(lower);
            } else if (searchCategory === "date") {
                return item.receiptDate.toLowerCase().includes(lower);
            } else if (searchCategory === "amount") {
                return item.amountPayed.toString().toLowerCase().includes(lower);
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
            <h1 className="page-title">Sales Receipt</h1>

            <Toolbar
                onRefresh={handleRefresh}
                onFilter={(category) => setSearchCategory(category)}
                onSearch={(term) => setSearchTerm(term)}
                selectedCategory={searchCategory}
                searchTerm={searchTerm}
            />

            <div className="table-container">
                <div className="table-header">
                    <h2>Sales Receipt Table</h2>
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
                                        <td>Rp{parseFloat(item.amountPayed).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                                        <td>
                                            <button
                                                className="detail-btn"
                                                onClick={() => navigate(`/sales-receipt/detail/${item.salesOrderId}`)}
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

export default SalesReceipt;