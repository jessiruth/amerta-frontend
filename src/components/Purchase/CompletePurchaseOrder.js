import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GudangDetail.css";
import "../../styles/AddSalesOrder.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CompletePurchaseOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [vendorName, setVendorName] = useState("");
    const [itemPrices, setItemPrices] = useState({});
    const [modalType, setModalType] = useState(null);
    const [successModal, setSuccessModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/");

        const fetchData = async () => {
            try {
                const res = await axiosInstance.get(`/api/purchase-order/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const order = res.data?.data;
                setData(order);

                const vendorRes = await axiosInstance.get(`/api/customer/${order.customerId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setVendorName(vendorRes.data?.data?.name || "Unknown");

                const prices = {};
                await Promise.all(
                    order.items.map(async (item) => {
                        try {
                            const barangRes = await axiosInstance.get(`/api/barang/${item.barangId}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            prices[item.barangId] = barangRes.data?.data?.hargaBeli || 0;
                        } catch {
                            prices[item.barangId] = 0;
                        }
                    })
                );
                setItemPrices(prices);
            } catch (error) {
                setData(null);
                const message = error.response?.data?.message || "Gagal mengambil purchase order.";
                toast.error(message);
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

    const getSubtotal = (barangId, qty, tax) => {
        const harga = itemPrices[barangId] || 0;
        const subtotal = harga * qty;
        return subtotal + (subtotal * (tax || 0) / 100);
    };

    const getTotalHargaBarang = () =>
        data.items.reduce((total, item) =>
            total + getSubtotal(item.barangId, item.quantity, item.tax), 0);

    const handleComplete = async () => {
        const token = localStorage.getItem("token");
        try {
            await axiosInstance.put(`/api/purchase-order/complete-delivery/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setModalType(null);
            setSuccessModal(true);
        } catch (error) {
            setModalType(null);
            const message = error.response?.data?.message || "Gagal menyelesaikan purchase order.";
            toast.error(message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!data) {
        return (
            <div className="error-container">
                <p className="error-text">Gagal memuat data. Silakan periksa koneksi atau hubungi admin.</p>
            </div>
        );
    }

    return (
        <div className="gudang-form-container">
            <ToastContainer />
            <div className="gudang-form-content">
                <div className="page-header">
                    <h1 className="page-title">Selesaikan Purchase Order</h1>
                </div>

                {/* Informasi Utama */}
                <div className="detail-card">
                    <div className="section-header"><h2 className="section-title">Informasi Utama</h2></div>
                    <div className="section-content">
                        <div className="detail-row"><span className="detail-label">ID:</span><span className="detail-value">{data.id}</span></div>
                        <div className="detail-row"><span className="detail-label">Vendor:</span><span className="detail-value">{vendorName}</span></div>
                        <div className="detail-row"><span className="detail-label">Tanggal:</span><span className="detail-value">{formatDate(data.purchaseDate)}</span></div>
                        <div className="detail-row"><span className="detail-label">Total Harga:</span><span className="detail-value">Rp{parseFloat(data.totalPrice).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
                        <div className="detail-row"><span className="detail-label">Status:</span><span className="detail-value">{data.status}</span></div>
                    </div>
                </div>

                {/* Daftar Item */}
                <div className="detail-card">
                    <div className="section-header"><h2 className="section-title">Daftar Item</h2></div>
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

                {/* Faktur */}
                {data.invoice && (
                    <div className="detail-card">
                        <div className="section-header"><h2 className="section-title">Faktur</h2></div>
                        <div className="section-content">
                            <div className="detail-row"><span className="detail-label">Tanggal Invoice:</span><span className="detail-value">{formatDate(data.invoice.invoiceDate)}</span></div>
                            <div className="detail-row"><span className="detail-label">Status:</span><span className="detail-value">{data.invoice.invoiceStatus}</span></div>
                            <div className="detail-row"><span className="detail-label">Total Tagihan:</span><span className="detail-value">Rp{parseFloat(data.invoice.totalAmount).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
                            <div className="detail-row"><span className="detail-label">Jatuh Tempo:</span><span className="detail-value">{formatDate(data.invoice.dueDate)}</span></div>
                            <div className="detail-row"><span className="detail-label">Sisa Tagihan:</span><span className="detail-value">Rp{parseFloat(data.invoice.remainingAmount).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
                        </div>
                    </div>
                )}

                {/* Surat Jalan */}
                {data.delivery && (
                    <div className="detail-card">
                        <div className="section-header"><h2 className="section-title">Surat Jalan</h2></div>
                        <div className="section-content">
                            <div className="detail-row"><span className="detail-label">Tanggal:</span><span className="detail-value">{formatDate(data.delivery.deliveryDate)}</span></div>
                            <div className="detail-row"><span className="detail-label">Status:</span><span className="detail-value">{data.delivery.deliveryStatus}</span></div>
                            <div className="detail-row"><span className="detail-label">Resi:</span><span className="detail-value">{data.delivery.trackingNumber}</span></div>
                            <div className="detail-row"><span className="detail-label">Biaya Kirim:</span><span className="detail-value">Rp{parseFloat(data.delivery.deliveryFee).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
                        </div>
                    </div>
                )}

                {/* Pembayaran */}
                {data.payment && (
                    <div className="detail-card">
                        <div className="section-header"><h2 className="section-title">Pembayaran</h2></div>
                        <div className="section-content">
                            <div className="detail-row"><span className="detail-label">Tanggal:</span><span className="detail-value">{formatDate(data.payment.paymentDate)}</span></div>
                            <div className="detail-row"><span className="detail-label">Metode:</span><span className="detail-value">{data.payment.paymentMethod}</span></div>
                            <div className="detail-row"><span className="detail-label">Status:</span><span className="detail-value">{data.payment.paymentStatus}</span></div>
                            <div className="detail-row"><span className="detail-label">Jumlah:</span><span className="detail-value">Rp{parseFloat(data.payment.totalAmountPayed).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
                        </div>
                    </div>
                )}

                {/* Tombol Aksi */}
                <div className="form-actions">
                    <button className="cancel-btn" onClick={() => navigate(`/purchase/completed/detail/${id}`)}>Batal</button>
                    <button className="submit-btn" onClick={() => setModalType("confirm")}>Selesaikan</button>
                </div>

                {/* Modal Konfirmasi */}
                {modalType && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Konfirmasi Penyelesaian</h3>
                                <button className="close-button" onClick={() => setModalType(null)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <p>Apakah Anda yakin ingin menyelesaikan Purchase Order ini?</p>
                            </div>
                            <div className="modal-footer">
                                <button className="secondary-btn" onClick={() => setModalType(null)}>Kembali</button>
                                <button className="primary-btn" onClick={handleComplete}>Ya, Selesaikan</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Sukses */}
                {successModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Purchase Order Selesai</h3>
                                <button className="close-button" onClick={() => setSuccessModal(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <p>Purchase Order berhasil diselesaikan. Anda akan diarahkan ke halaman detail.</p>
                            </div>
                            <div className="modal-footer">
                                <button className="primary-btn" onClick={() => navigate(`/purchase/completed/detail/${id}`)}>OK</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompletePurchaseOrder;