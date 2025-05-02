import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GudangDetail.css";

const ConfirmShippingSalesOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [customerName, setCustomerName] = useState("");
    const [itemPrices, setItemPrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [modalType, setModalType] = useState(null);
    const [successModal, setSuccessModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/");

        const fetchData = async () => {
            try {
                const res = await axiosInstance.get(`/api/sales-order/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const order = res.data?.data;
                setData(order);

                const customerRes = await axiosInstance.get(`/api/customer/${order.customerId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCustomerName(customerRes.data?.data?.name || "Unknown");

                // Ambil harga jual per barang
                const prices = {};
                await Promise.all(
                    order.items.map(async (item) => {
                        try {
                            const res = await axiosInstance.get(`/api/barang/${item.barangId}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            prices[item.barangId] = res.data?.data?.hargaJual || 0;
                        } catch {
                            prices[item.barangId] = 0;
                        }
                    })
                );
                setItemPrices(prices);
            } catch {
                alert("Gagal memuat detail Sales Order");
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

    const getTotal = () =>
        data.items.reduce((total, item) =>
            total + getSubtotal(item.barangId, item.quantity, item.tax), 0);

    const handleConfirmShipping = async () => {
        const token = localStorage.getItem("token");
        try {
            await axiosInstance.put(`/api/sales-order/confirm-shipping/${id}`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setModalType(null);
            setSuccessModal(true);
        } catch {
            alert("Gagal mengkonfirmasi pengiriman.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!data) return <p>Data tidak ditemukan</p>;

    return (
        <div className="gudang-form-container">
            <div className="gudang-form-content">
                <div className="page-header">
                    <h1 className="page-title">Konfirmasi Pengiriman Sales Order</h1>
                </div>

                {/* Informasi Utama */}
                <div className="detail-card">
                    <div className="section-header"><h2 className="section-title">Informasi Utama</h2></div>
                    <div className="section-content">
                        <div className="detail-row"><span className="detail-label">ID:</span><span className="detail-value">{data.id}</span></div>
                        <div className="detail-row"><span className="detail-label">Customer:</span><span className="detail-value">{customerName}</span></div>
                        <div className="detail-row"><span className="detail-label">Tanggal:</span><span className="detail-value">{formatDate(data.salesDate)}</span></div>
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
                                    <th>Qty</th>
                                    <th>Gudang Asal</th>
                                    <th>Pajak</th>
                                    <th>Harga Satuan</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((item) => {
                                    const harga = itemPrices[item.barangId] || 0;
                                    const subtotal = getSubtotal(item.barangId, item.quantity, item.tax);
                                    return (
                                        <tr key={item.id}>
                                            <td>{item.barangId}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.gudangTujuan}</td>
                                            <td>{item.tax || 0}%</td>
                                            <td>Rp{parseFloat(harga).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                                            <td>Rp{parseFloat(subtotal).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "right", fontWeight: "bold" }}>Total</td>
                                    <td style={{ fontWeight: "bold" }}>Rp{parseFloat(getTotal()).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
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
                            <div className="detail-row">
                                <span className="detail-label">Tanggal Invoice:</span>
                                <span className="detail-value">{formatDate(data.invoice.invoiceDate)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Total Tagihan:</span>
                                <span className="detail-value">Rp{parseFloat(data.invoice.totalAmount).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Jatuh Tempo:</span>
                                <span className="detail-value">{formatDate(data.invoice.dueDate)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Status Faktur:</span>
                                <span className="detail-value">{data.invoice.invoiceStatus}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pengiriman */}
                {data.shipping && (
                    <div className="detail-card">
                        <div className="section-header">
                            <h2 className="section-title">Pengiriman</h2>
                        </div>

                        <div className="section-content">
                            <div className="detail-row">
                                <span className="detail-label">Tanggal Pengiriman:</span>
                                <span className="detail-value">{formatDate(data.shipping.shippingDate)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Status:</span>
                                <span className="detail-value">{data.shipping.shippingStatus}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Nomor Resi:</span>
                                <span className="detail-value">{data.shipping.trackingNumber}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Biaya Kirim:</span>
                                <span className="detail-value">Rp{parseFloat(data.shipping.shippingFee).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tombol Aksi */}
                <div className="form-actions">
                    {data.status === "IN SHIPPING" ? (
                        <>
                            <button className="cancel-btn" onClick={() => setModalType("cancel")}>Batal</button>
                            <button className="submit-btn" onClick={() => setModalType("confirm")}>
                                Konfirmasi Pengiriman Selesai
                            </button>
                        </>
                    ) : (
                        <button className="cancel-btn" onClick={() => navigate("/sales-order")}>Kembali</button>
                    )}
                </div>

                {/* Modal Konfirmasi */}
                {modalType && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>{modalType === "confirm" ? "Konfirmasi Pengiriman Selesai" : "Batalkan Proses"}</h3>
                                <button className="close-button" onClick={() => setModalType(null)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                {modalType === "confirm" ? (
                                    <p>Apakah Anda yakin pengiriman telah selesai?</p>
                                ) : (
                                    <>
                                        <p>Apakah Anda yakin ingin membatalkan proses ini?</p>
                                        <p className="warning-text">Tidak ada data yang akan diubah.</p>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="secondary-btn" onClick={() => setModalType(null)}>Kembali</button>
                                <button
                                    className={modalType === "confirm" ? "primary-btn" : "danger-btn"}
                                    onClick={() => {
                                        if (modalType === "confirm") handleConfirmShipping();
                                        else navigate("/sales-order");
                                    }}
                                >
                                    {modalType === "confirm" ? "Ya, Konfirmasi" : "Ya, Batalkan"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Sukses */}
                {successModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Pengiriman Dikonfirmasi</h3>
                                <button className="close-button" onClick={() => setSuccessModal(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <p>Pengiriman telah dikonfirmasi selesai. Anda akan diarahkan ke detail Sales Order.</p>
                            </div>
                            <div className="modal-footer">
                                <button className="primary-btn" onClick={() => navigate(`/sales/completed/detail/${id}`)}>OK</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfirmShippingSalesOrder;
