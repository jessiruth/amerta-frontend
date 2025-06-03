import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GudangDetail.css";
import "../../styles/AddSalesOrder.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConfirmPurchaseOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [vendorName, setVendorName] = useState("");
    const [itemPrices, setItemPrices] = useState({});
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
    const [paymentTerms, setPaymentTerms] = useState("");
    const [modalType, setModalType] = useState(null);
    const [successModal, setSuccessModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [inputErrors, setInputErrors] = useState({});

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
                const message = error.response?.data?.message || "Gagal mengupdate barang.";
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

    const handleConfirm = async () => {
        const token = localStorage.getItem("token");
        try {
            await axiosInstance.put(`/api/purchase-order/confirm/${id}`, {
                invoiceDate,
                paymentTerms: Number(paymentTerms),
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setModalType(null);
            setSuccessModal(true);
        } catch (error){
            setModalType(null);
            const message = error.response?.data?.message || "Gagal mengupdate barang.";
            toast.error(message);
        }
    };

    const validateInputs = () => {
        const errors = {};
        if (new Date(invoiceDate) < new Date(data.purchaseDate)) {
            errors.invoiceDate = "Tanggal invoice tidak boleh lebih awal dari tanggal pembelian.";
        }
        if (!paymentTerms || Number(paymentTerms) < 1) {
            errors.paymentTerms = "Jangka waktu pembayaran tidak boleh kosong.";
        } else if (Number(paymentTerms) < 1) {
            errors.paymentTerms = "Jangka waktu pembayaran minimal 1 hari.";
        }   
        setInputErrors(errors);
        return Object.keys(errors).length === 0;
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
                    <h1 className="page-title">Konfirmasi Purchase Order</h1>
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

                {/* Input Konfirmasi */}
                <div className="detail-card">
                    <div className="section-header"><h2 className="section-title">Input Konfirmasi</h2></div>
                    <div className="section-content">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Tanggal Invoice</label>
                                <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
                                {inputErrors.invoiceDate && <span className="error-message">{inputErrors.invoiceDate}</span>}
                            </div>
                            <div className="form-group">
                                <label>Jangka Waktu Pembayaran (hari)</label>
                                <input type="number" min="1" placeholder="Contoh: 30" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
                                {inputErrors.paymentTerms && <span className="error-message">{inputErrors.paymentTerms}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="form-actions">
                    <button className="cancel-btn" onClick={() => setModalType("cancel")}>Batal</button>
                    <button className="submit-btn" onClick={() => {
                        if (validateInputs()) setModalType("confirm");
                    }}>Konfirmasi</button>
                </div>

                {/* Modal Konfirmasi */}
                {modalType && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>{modalType === "confirm" ? "Konfirmasi Purchase Order" : "Batalkan Konfirmasi"}</h3>
                                <button className="close-button" onClick={() => setModalType(null)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                {modalType === "confirm" ? (
                                    <p>Apakah Anda yakin ingin mengkonfirmasi Purchase Order ini?</p>
                                ) : (
                                    <>
                                        <p>Apakah Anda yakin ingin membatalkan proses ini?</p>
                                        <p className="warning-text">Semua data input akan hilang.</p>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="secondary-btn" onClick={() => setModalType(null)}>Kembali</button>
                                <button
                                    className={modalType === "confirm" ? "primary-btn" : "danger-btn"}
                                    onClick={() => {
                                        if (modalType === "confirm") handleConfirm();
                                        else navigate(`/purchase/completed/detail/${id}`);
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
                                <h3>Purchase Order Dikonfirmasi</h3>
                                <button className="close-button" onClick={() => setSuccessModal(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <p>Purchase Order berhasil dikonfirmasi. Anda akan diarahkan ke halaman detail.</p>
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

export default ConfirmPurchaseOrder;
