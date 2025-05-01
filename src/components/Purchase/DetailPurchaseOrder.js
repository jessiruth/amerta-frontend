import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GudangDetail.css";

const DetailPurchaseOrder = () => {
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

    const handleBack = () => navigate("/purchase-order");

    const handleUpdate = () => {
        const status = data.status;
        if (status === "CREATED") navigate(`/purchase-order/confirm/${data.id}`);
        else if (status === "CONFIRMED") navigate(`/purchase-order/payment/${data.id}`);
        else if (status === "PAID") navigate(`/purchase-order/delivery/${data.id}`);
        else if (status === "IN DELIVERY") navigate(`/purchase-order/complete/${data.id}`);
    };

    const getSubtotal = (barangId, qty, tax) => {
        const harga = itemPrices[barangId] || 0;
        const subtotal = harga * qty;
        return subtotal + (subtotal * (tax || 0) / 100);
    };

    const getTotalHargaBarang = () =>
        data.items.reduce((total, item) =>
            total + getSubtotal(item.barangId, item.quantity, item.pajak), 0);

    if (loading) return <div className="loading-container"><p>Loading...</p></div>;
    if (error || !data) return <div className="error-container"><p>{error}</p></div>;

    return (
        <div className="gudang-detail-container">
            <div className="gudang-detail-content">
                <div className="page-header">
                    <h1 className="page-title">{data.id}</h1>
                </div>

                <div className="action-buttons">
                    <button className="back-btn" onClick={handleBack}>Kembali</button>
                    {["CREATED", "CONFIRMED", "PAID", "IN DELIVERY"].includes(data.status) && (
                        <button className="update-btn" onClick={handleUpdate}>Lanjutkan</button>
                    )}
                    <button className="print-btn" onClick={() => window.print()}>Print</button>
                </div>

                <div className="detail-card">
                    <div className="section-header">
                        <h2 className="section-title">Informasi Utama</h2>
                    </div>
                    <div className="section-content">
                        <div className="detail-row"><span className="detail-label">Vendor:</span><span className="detail-value">{vendorName}</span></div>
                        <div className="detail-row"><span className="detail-label">Tanggal Beli:</span><span className="detail-value">{formatDate(data.purchaseDate)}</span></div>
                        <div className="detail-row"><span className="detail-label">Status:</span><span className="detail-value">{data.status}</span></div>
                        <div className="detail-row"><span className="detail-label">Total Harga:</span><span className="detail-value">Rp{parseFloat(data.totalPrice).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
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
                                        <td>{item.pajak || 0}%</td>
                                        <td>Rp{parseFloat(itemPrices[item.barangId] || 0).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                                        <td>Rp{parseFloat(getSubtotal(item.barangId, item.quantity, item.pajak)).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
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

                {data.invoice && (
                    <div className="detail-card">
                        <div className="section-header">
                            <h2 className="section-title">Faktur</h2>
                        </div>
                        <div className="section-content">
                            <div className="detail-row"><span className="detail-label">Tanggal Invoice:</span><span className="detail-value">{formatDate(data.invoice.invoiceDate)}</span></div>
                            <div className="detail-row"><span className="detail-label">Status Invoice:</span><span className="detail-value">{data.invoice.invoiceStatus}</span></div>
                            <div className="detail-row"><span className="detail-label">Total Tagihan:</span><span className="detail-value">Rp{parseFloat(data.invoice.totalAmount).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
                            <div className="detail-row"><span className="detail-label">Jatuh Tempo:</span><span className="detail-value">{formatDate(data.invoice.dueDate)}</span></div>
                            <div className="detail-row"><span className="detail-label">Sisa Tagihan:</span><span className="detail-value">Rp{parseFloat(data.invoice.remainingAmount).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>

                            {/* Tombol navigasi ke halaman detail Faktur */}
                            <div style={{ marginTop: "15px" }}>
                                <button className="update-btn" onClick={() => navigate(`/purchase-invoice/detail/${data.invoice.id}`)}>
                                    Lihat Detail Faktur
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {data.delivery && (
                    <div className="detail-card">
                        <div className="section-header">
                            <h2 className="section-title">Surat Jalan</h2>
                        </div>
                        <div className="section-content">
                            <div className="detail-row"><span className="detail-label">Tanggal Pengiriman:</span><span className="detail-value">{formatDate(data.delivery.deliveryDate)}</span></div>
                            <div className="detail-row"><span className="detail-label">Status:</span><span className="detail-value">{data.delivery.deliveryStatus}</span></div>
                            <div className="detail-row"><span className="detail-label">Nomor Resi:</span><span className="detail-value">{data.delivery.trackingNumber}</span></div>
                            <div className="detail-row"><span className="detail-label">Biaya Kirim:</span><span className="detail-value">Rp{parseFloat(data.delivery.deliveryFee).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>

                            {/* Tombol navigasi ke halaman detail Surat Jalan */}
                            <div style={{ marginTop: "15px" }}>
                                <button className="update-btn" onClick={() => navigate(`/purchase-delivery/detail/${data.delivery.id}`)}>
                                    Lihat Detail Surat Jalan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {data.payment && (
                    <div className="detail-card">
                        <div className="section-header">
                            <h2 className="section-title">Pembayaran</h2>
                        </div>
                        <div className="section-content">
                            <div className="detail-row"><span className="detail-label">Tanggal:</span><span className="detail-value">{formatDate(data.payment.paymentDate)}</span></div>
                            <div className="detail-row"><span className="detail-label">Metode:</span><span className="detail-value">{data.payment.paymentMethod}</span></div>
                            <div className="detail-row"><span className="detail-label">Status:</span><span className="detail-value">{data.payment.paymentStatus}</span></div>
                            <div className="detail-row"><span className="detail-label">Jumlah Dibayar:</span><span className="detail-value">Rp{parseFloat(data.payment.totalAmountPayed).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>

                            {/* Tombol navigasi ke halaman detail Pembayaran */}
                            <div style={{ marginTop: "15px" }}>
                                <button className="update-btn" onClick={() => navigate(`/purchase-payment/detail/${data.payment.id}`)}>
                                    Lihat Detail Pembayaran
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {data.receipt && (
                    <div className="detail-card">
                        <div className="section-header">
                            <h2 className="section-title">Nota Penerimaan</h2>
                        </div>
                        <div className="section-content">
                            <div className="detail-row"><span className="detail-label">Tanggal Nota:</span><span className="detail-value">{formatDate(data.receipt.receiptDate)}</span></div>
                            <div className="detail-row"><span className="detail-label">Jumlah Diterima:</span><span className="detail-value">Rp{parseFloat(data.receipt.amountPayed).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>

                            {/* Tombol navigasi ke halaman detail Nota */}
                            <div style={{ marginTop: "15px" }}>
                                <button className="update-btn" onClick={() => navigate(`/purchase-receipt/detail/${data.receipt.id}`)}>
                                    Lihat Detail Nota
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailPurchaseOrder;
