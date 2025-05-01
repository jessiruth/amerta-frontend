import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GudangDetail.css";

const PaymentSalesOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [customerName, setCustomerName] = useState("");
    const [itemPrices, setItemPrices] = useState({});
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [totalAmountPayed, setTotalAmountPayed] = useState("");
    const [modalType, setModalType] = useState(null);
    const [successModal, setSuccessModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [inputErrors, setInputErrors] = useState({});

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

    const handlePayment = async () => {
        const token = localStorage.getItem("token");
        try {
            await axiosInstance.put(`/api/sales-order/payment/${id}`, {
                paymentDate,
                paymentMethod,
                totalAmountPayed: parseFloat(totalAmountPayed),
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setModalType(null);
            setSuccessModal(true);
        } catch {
            alert("Gagal memproses pembayaran.");
        }
    };

    const validateInputs = () => {
        const errors = {};

        if (new Date(paymentDate) < new Date(data.invoice?.invoiceDate)) {
            errors.paymentDate = "Tanggal pembayaran tidak boleh sebelum tanggal invoice.";
        }

        if (!totalAmountPayed || parseFloat(totalAmountPayed) <= 0) {
            errors.totalAmountPayed = "Jumlah dibayar harus lebih dari 0.";
        }

        if (parseFloat(totalAmountPayed) > data.invoice?.remainingAmount) {
            errors.totalAmountPayed = "Jumlah dibayar tidak boleh lebih dari sisa tagihan.";
        }

        setInputErrors(errors);
        return Object.keys(errors).length === 0;
    };


    if (loading) return <p>Loading...</p>;
    if (!data) return <p>Data tidak ditemukan</p>;

    return (
        <div className="gudang-form-container">
            <div className="gudang-form-content">
                <div className="page-header">
                    <h1 className="page-title">Pembayaran Sales Order</h1>
                </div>

                <div className="detail-card">
                    <div className="section-header"><h2 className="section-title">Informasi Utama</h2></div>
                    <div className="section-content">
                        <div className="detail-row"><span className="detail-label">ID:</span><span className="detail-value">{data.id}</span></div>
                        <div className="detail-row"><span className="detail-label">Customer:</span><span className="detail-value">{customerName}</span></div>
                        <div className="detail-row"><span className="detail-label">Tanggal:</span><span className="detail-value">{formatDate(data.salesDate)}</span></div>
                        <div className="detail-row"><span className="detail-label">Status:</span><span className="detail-value">{data.status}</span></div>
                    </div>
                </div>

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
                                            <td>Rp {parseFloat(harga).toLocaleString("id-ID")}</td>
                                            <td>Rp {parseFloat(subtotal).toLocaleString("id-ID")}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "right", fontWeight: "bold" }}>Total</td>
                                    <td style={{ fontWeight: "bold" }}>Rp {parseFloat(getTotal()).toLocaleString("id-ID")}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Invoice */}
                {data.invoice && (
                    <div className="detail-card">
                        <div className="section-header">
                            <h2 className="section-title">Faktur</h2>
                        </div>

                        <div className="section-content">
                            <div className="detail-row">
                                <span className="detail-label">Tanggal Invoice:</span>
                                <span className="detail-value">{formatDate(data.invoice.invoiceDate)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Status Invoice:</span>
                                <span className="detail-value">{data.invoice.invoiceStatus}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Total Tagihan:</span>
                                <span className="detail-value">Rp {parseFloat(data.invoice.totalAmount).toLocaleString("id-ID")}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Jatuh Tempo:</span>
                                <span className="detail-value">{formatDate(data.invoice.dueDate)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Sisa Tagihan:</span>
                                <span className="detail-value">Rp {parseFloat(data.invoice.remainingAmount).toLocaleString("id-ID")}</span>
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
                                <span className="detail-value">Rp {parseFloat(data.shipping.shippingFee).toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pembayaran */}
                {data.payment && (
                    <div className="detail-card">
                        <div className="section-header">
                            <h2 className="section-title">Pembayaran</h2>
                        </div>

                        <div className="section-content">
                            <div className="detail-row">
                                <span className="detail-label">Tanggal:</span>
                                <span className="detail-value">{formatDate(data.payment.paymentDate)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Metode:</span>
                                <span className="detail-value">{data.payment.paymentMethod}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Status:</span>
                                <span className="detail-value">{data.payment.paymentStatus}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Jumlah Dibayar:</span>
                                <span className="detail-value">Rp {parseFloat(data.payment.totalAmountPayed).toLocaleString("id-ID")}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Sisa Tagihan:</span>
                                <span className="detail-value">Rp {parseFloat(data.invoice.remainingAmount).toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Receipt */}
                {data.receipt && (
                    <div className="detail-card">
                        <div className="section-header">
                            <h2 className="section-title">Nota Penerimaan</h2>
                        </div>

                        <div className="section-content">
                            <div className="detail-row">
                                <span className="detail-label">Tanggal Nota:</span>
                                <span className="detail-value">{formatDate(data.receipt.receiptDate)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Jumlah Diterima:</span>
                                <span className="detail-value">Rp {parseFloat(data.receipt.amountPayed).toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                    </div>
                )}

                {data.status === "SHIPPED" && (
                    <div className="detail-card">
                        <div className="section-header"><h2 className="section-title">Input Pembayaran</h2></div>
                        <div className="section-content">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tanggal Pembayaran</label>
                                    <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                                    {inputErrors.paymentDate && <span className="error-message">{inputErrors.paymentDate}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Metode Pembayaran</label>
                                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                        <option value="CASH">CASH</option>
                                        <option value="TRANSFER">TRANSFER</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Jumlah Dibayar</label>
                                    <input type="number" value={totalAmountPayed} onChange={(e) => setTotalAmountPayed(e.target.value)} />
                                    {inputErrors.totalAmountPayed && <span className="error-message">{inputErrors.totalAmountPayed}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-actions">
                    {data.status === "SHIPPED" ? (
                        <>
                            <button className="cancel-btn" onClick={() => setModalType("cancel")}>Batal</button>
                            <button className="submit-btn" onClick={() => {
                                if (validateInputs()) setModalType("confirm");
                            }}>Bayar</button>
                        </>
                    ) : (
                        <button className="cancel-btn" onClick={() => navigate("/sales-order")}>Kembali</button>
                    )}
                </div>

                {modalType && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>{modalType === "confirm" ? "Konfirmasi Pembayaran" : "Batalkan Proses"}</h3>
                                <button className="close-button" onClick={() => setModalType(null)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                {modalType === "confirm" ? (
                                    <p>Apakah Anda yakin ingin melakukan pembayaran?</p>
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
                                        if (modalType === "confirm") handlePayment();
                                        else navigate("/sales-order");
                                    }}
                                >
                                    {modalType === "confirm" ? "Ya, Bayar" : "Ya, Batalkan"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {successModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Pembayaran Berhasil</h3>
                                <button className="close-button" onClick={() => setSuccessModal(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <p>Pembayaran telah diterima. Anda akan diarahkan ke detail Sales Order.</p>
                            </div>
                            <div className="modal-footer">
                                <button className="primary-btn" onClick={() => navigate(`/sales-order/detail/${id}`)}>OK</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PaymentSalesOrder;
