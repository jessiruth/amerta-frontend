import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import "../styles/GudangDetail.css";

const PurchaseInvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [vendorName, setVendorName] = useState("");
    const [itemPrices, setItemPrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) return navigate("/");

            setLoading(true);
            try {
                const response = await axiosInstance.get(`/api/purchase-order/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const poData = response.data?.data;
                setData(poData);

                const vendorRes = await axiosInstance.get(`/api/customer/${poData.customerId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setVendorName(vendorRes.data?.data?.name || "Unknown");

                const prices = {};
                await Promise.all(
                    poData.items.map(async (item) => {
                        try {
                            const res = await axiosInstance.get(`/api/barang/${item.barangId}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            prices[item.barangId] = res.data?.data?.hargaBeli || 0;
                        } catch {
                            prices[item.barangId] = 0;
                        }
                    })
                );
                setItemPrices(prices);
            } catch (err) {
                console.error(err);
                setError("Gagal memuat detail purchase order.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const handleBack = () => navigate("/purchase-invoice");

    const getSubtotal = (barangId, qty, tax) => {
        const harga = itemPrices[barangId] || 0;
        const subtotal = harga * qty;
        return subtotal + (subtotal * (tax || 0) / 100);
    };

    const getTotalHargaBarang = () =>
        data.items.reduce((total, item) =>
            total + getSubtotal(item.barangId, item.quantity, item.tax), 0);

    if (loading) return <div className="loading-container"><p>Loading...</p></div>;
    if (error || !data) return <div className="error-container"><p>{error}</p></div>;

    return (
        <div className="gudang-detail-container">
            <div className="gudang-detail-content">
                <div className="page-header">
                    <h1 className="page-title">Purchase Invoice</h1>
                    <h1 className="page-title">{data.invoice.id}</h1>
                </div>

                <div className="action-buttons">
                    <button className="back-btn" onClick={handleBack}>Kembali</button>
                    <button className="print-btn" onClick={() => window.print()}>Print</button>
                </div>

                <div className="detail-card">
                    <div className="section-header">
                        <h2 className="section-title">Informasi Utama</h2>
                    </div>
                    <div className="section-content">
                        <div className="detail-row"><span className="detail-label">ID Purchase Order:</span><span className="detail-value">{data.id}</span></div>
                        <div className="detail-row"><span className="detail-label">Vendor:</span><span className="detail-value">{vendorName}</span></div>
                        <div className="detail-row"><span className="detail-label">Tanggal Invoice:</span><span className="detail-value">{formatDate(data.invoice.invoiceDate)}</span></div>
                        <div className="detail-row"><span className="detail-label">Tanggal Jatuh Tempo:</span><span className="detail-value">{formatDate(data.invoice.dueDate)}</span></div>
                        <div className="detail-row"><span className="detail-label">Status:</span><span className="detail-value">{data.invoice.invoiceStatus}</span></div>
                        <div className="detail-row"><span className="detail-label">Payment Terms:</span><span className="detail-value">{data.invoice.paymentTerms}</span></div>
                        <div className="detail-row"><span className="detail-label">Total Harga:</span><span className="detail-value">Rp{parseFloat(data.invoice.totalAmount).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
                        <div className="detail-row"><span className="detail-label">Sisa Pembayaran:</span><span className="detail-value">Rp{parseFloat(data.invoice.remainingAmount).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
                    </div>
                </div>

                <div className="detail-card">
                    <div className="section-header">
                        <h2 className="section-title">Daftar Item</h2>
                    </div>
                    <div className="section-content">
                        <table className="barang-table">
                            <thead>
                                <tr>
                                    <th>Kode Barang</th>
                                    <th>Kuantitas</th>
                                    <th>Gudang Tujuan</th>
                                    <th>Pajak (%)</th>
                                    <th>Harga Satuan</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((item) => (
                                    <tr key={item.barangId}>
                                        <td>{item.barangId}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.gudangTujuan}</td>
                                        <td>{item.tax || 0}%</td>
                                        <td>Rp{parseFloat(itemPrices[item.barangId] || 0).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                                        <td>Rp{parseFloat(getSubtotal(item.barangId, item.quantity, item.tax)).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "right", fontWeight: "bold" }}>Total</td>
                                    <td style={{ fontWeight: "bold" }}>Rp{parseFloat(getTotalHargaBarang()).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseInvoiceDetail;