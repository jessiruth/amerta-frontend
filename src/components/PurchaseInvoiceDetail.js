import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import "../styles/ExpenseDetail.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PurchaseInvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                if (!token) {
                    setError("Unauthorized: Token tidak ditemukan");
                    setLoading(false);
                    return;
                }

                const response = await axiosInstance.get(`/api/purchase-invoice/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setData(response.data.data);
                setLoading(false);
            } catch (err) {
                if (err.response?.data?.message) {
                    setError(err.response.data.message);
                } else {
                    setError("Terjadi kesalahan saat mengambil data.");
                }
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id, token]);

    const handleDownloadPdf = async () => {
        const element = document.getElementById("invoice-pdf");
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF();
            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, width, height);
            pdf.save(`invoice-${id}.pdf`);
        } catch (error) {
            alert("Gagal membuat PDF");
        }
    };

    if (loading) return <p className="loading-message">Memuat data...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!data) return <p className="error-message">Data tidak ditemukan.</p>;

    return (
        <div className="expense-detail-container">
            <div id="invoice-pdf">
                <h2>Detail Purchase Invoice {data.id}</h2>
                <table className="expense-detail-table">
                    <tbody>
                        <tr>
                            <th>Purchase Order ID</th>
                            <td>{data.purchaseOrderId || "-"}</td>
                        </tr>
                        <tr>
                            <th>Status</th>
                            <td>{data.invoiceStatus || "-"}</td>
                        </tr>
                        <tr>
                            <th>Jumlah</th>
                            <td>{data.totalAmount?.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) || "-"}</td>
                        </tr>
                        <tr>
                            <th>Tanggal Invoice</th>
                            <td>{data.invoiceDate ? new Date(data.invoiceDate).toLocaleDateString("id-ID") : "-"}</td>
                        </tr>
                        <tr>
                            <th>Jatuh Tempo</th>
                            <td>{data.dueDate ? new Date(data.dueDate).toLocaleDateString("id-ID") : "-"}</td>
                        </tr>
                        <tr>
                            <th>Sisa Pembayaran</th>
                            <td>{data.remainingAmount?.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) || "-"}</td>
                        </tr>
                        <tr>
                            <th>Payment Terms</th>
                            <td>{data.paymentTerms ? `${data.paymentTerms} hari` : "-"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: "20px" }}>
                <button className="back-button" onClick={() => navigate("/purchase-invoice")}>
                    Back
                </button>
                <button className="detail-btn" onClick={handleDownloadPdf} style={{ marginLeft: "10px" }}>
                    Download PDF
                </button>
            </div>
        </div>
    );
};

export default PurchaseInvoiceDetail;
