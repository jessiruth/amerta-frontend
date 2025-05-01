import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Toolbar from "../components/ToolbarInvoice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/GudangList.css";

const PurchaseInvoice = () => {
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
            const response = await axiosInstance.get("/api/purchase-invoice/viewall", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data && Array.isArray(response.data.data)) {
                setData(response.data.data);
                setFilteredData(response.data.data);
            } else {
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();

        const filtered = data.filter((item) => {
            if (searchCategory === "status") {
                return item.invoiceStatus.toLowerCase().includes(lower);
            } else if (searchCategory === "amount") {
                const searchValue = searchTerm.replace(/[^0-9]/g, "");
                if (searchValue === "") return true;
                return item.totalAmount.toString().includes(searchValue);
            } else if (searchCategory === "due") {
                return item.dueDate.toLowerCase().includes(lower);
            } else if (searchCategory === "id") {
                return item.id.toLowerCase().includes(lower);
            } else {
                return (
                    item.invoiceStatus.toLowerCase().includes(lower) ||
                    item.totalAmount.toString().includes(searchTerm.replace(/[^0-9]/g, "")) ||
                    item.dueDate.toLowerCase().includes(lower) ||
                    item.id.toLowerCase().includes(lower)
                );
            }
        });        

        setFilteredData(filtered);
    }, [searchTerm, searchCategory, data]);

    const handleRefresh = () => {
        setSearchTerm("");
        setSearchCategory("all");
        setFilteredData(data);
        fetchData();
    };

    const downloadPdf = (item) => {
        const doc = new jsPDF();
    
        doc.setFontSize(18);
        doc.text("FAKTUR PEMBELIAN", 14, 20);
    
        doc.setFontSize(12);
        doc.text(`ID Faktur: ${item.id}`, 14, 35);
        doc.text(`Status: ${item.invoiceStatus}`, 14, 42);
        doc.text(`Jumlah: Rp ${item.totalAmount.toLocaleString("id-ID")}`, 14, 49);
        doc.text(`Jatuh Tempo: ${item.dueDate}`, 14, 56);
        doc.text(`Sisa Pembayaran: Rp ${item.remainingAmount.toLocaleString("id-ID")}`, 14, 63);
    
        // Optional: Table placeholder
        autoTable(doc, {
            startY: 75,
            head: [["Deskripsi", "Nilai"]],
            body: [
                ["Total", `Rp ${item.totalAmount.toLocaleString("id-ID")}`],
                ["Sisa Bayar", `Rp ${item.remainingAmount.toLocaleString("id-ID")}`],
                ["Status", item.invoiceStatus],
                ["Jatuh Tempo", item.dueDate],
            ],
        });
    
        doc.save(`invoice-${item.id}.pdf`);
    };    

    return (
        <div className="gudang-list-container">
            <h1 className="page-title">Purchase Invoice</h1>

            <Toolbar
                onRefresh={handleRefresh}
                onFilter={(category) => setSearchCategory(category)}
                onSearch={(term) => setSearchTerm(term)}
                selectedCategory={searchCategory}
                searchTerm={searchTerm}
            />

            <div className="table-container">
                <div className="table-header">
                    <h2>Purchase Invoice Table</h2>
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
                                <th>Status</th>
                                <th>Jumlah</th>
                                <th>Jatuh Tempo</th>
                                <th>Sisa Bayar</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.invoiceStatus}</td>
                                        <td>{item.totalAmount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
                                        <td>{item.dueDate}</td>
                                        <td>{item.remainingAmount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
                                        <td>
                                        <td>
                                        <button
                                            className="detail-btn"
                                            onClick={() => navigate(`/purchase-invoice/detail/${item.id}`)}
                                        >
                                            Detail
                                        </button>
                                        <button
                                            className="pdf-btn"
                                            onClick={() => downloadPdf(item.id)}
                                            style={{ marginLeft: "8px" }}
                                        >
                                            Download PDF
                                        </button>
                                        </td>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-data">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PurchaseInvoice
