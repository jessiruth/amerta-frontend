import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/ExpenseDetail.css";

const SalesInvoiceDetail = () => {
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

                const response = await axiosInstance.get(`/api/sales-invoice/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
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

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const downloadPdf = () => {
        if (!data) return;

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("FAKTUR PENJUALAN", 14, 20);

        doc.setFontSize(12);
        doc.text(`ID Faktur: ${data.id}`, 14, 35);
        doc.text(`Sales Order ID: ${data.salesOrderId}`, 14, 42);
        doc.text(`Status: ${data.invoiceStatus}`, 14, 49);
        doc.text(`Jumlah: Rp ${data.totalAmount.toLocaleString("id-ID")}`, 14, 56);
        doc.text(`Jatuh Tempo: ${formatDate(data.dueDate)}`, 14, 63);
        doc.text(`Sisa Pembayaran: Rp ${data.remainingAmount.toLocaleString("id-ID")}`, 14, 70);

        autoTable(doc, {
            startY: 80,
            head: [["Deskripsi", "Nilai"]],
            body: [
                ["Total", `Rp ${data.totalAmount.toLocaleString("id-ID")}`],
                ["Sisa Bayar", `Rp ${data.remainingAmount.toLocaleString("id-ID")}`],
                ["Status", data.invoiceStatus],
                ["Jatuh Tempo", formatDate(data.dueDate)],
                ["Payment Terms", `${data.paymentTerms} hari`],
            ],
        });

        doc.save(`sales-invoice-${data.id}.pdf`);
    };

    if (loading) return <p className="loading-message">Memuat data...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!data) return <p className="error-message">Data tidak ditemukan.</p>;

    return (
        <div className="gudang-detail-container">
            <div className="gudang-detail-content">
                <div className="page-header">
                    <h1 className="page-title">{data.id}</h1>
                </div>

                <div className="detail-card">
                    <div className="section-header">
                        <h2 className="section-title">Informasi Faktur</h2>
                    </div>
                    <div className="section-content">
                        <div className="detail-row">
                            <span className="detail-label">Sales Order ID:</span>
                            <span className="detail-value">{data.salesOrderId || "-"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value">{data.invoiceStatus || "-"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Jumlah:</span>
                            <span className="detail-value">{data.totalAmount?.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) || "-"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Tanggal Invoice:</span>
                            <span className="detail-value">{data.invoiceDate ? formatDate(data.invoiceDate) : "-"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Jatuh Tempo:</span>
                            <span className="detail-value">{data.dueDate ? formatDate(data.dueDate) : "-"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Sisa Pembayaran:</span>
                            <span className="detail-value">{data.remainingAmount?.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) || "-"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Payment Terms:</span>
                            <span className="detail-value">{data.paymentTerms ? `${data.paymentTerms} hari` : "-"}</span>
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
                    <button className="back-btn" onClick={() => navigate("/sales-invoice")}>Kembali</button>
                    <button className="print-btn" onClick={downloadPdf}>Download PDF</button>
                </div>
            </div>
        </div>
    );
};

export default SalesInvoiceDetail;
