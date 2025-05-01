import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GudangDetail.css";
import "../../styles/AddSalesOrder.css";

const ConfirmSalesOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [customerName, setCustomerName] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
    const [paymentTerms, setPaymentTerms] = useState(30);
    const [loading, setLoading] = useState(true);
    const [modalType, setModalType] = useState(null);
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

    const handleConfirm = async () => {
        const token = localStorage.getItem("token");
        try {
            await axiosInstance.put(`/api/sales-order/confirm/${id}`, {
                invoiceDate,
                paymentTerms: Number(paymentTerms),
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Sales Order berhasil dikonfirmasi.");
            navigate(`/sales-order/detail/${id}`);
        } catch {
            alert("Gagal mengkonfirmasi Sales Order.");
        }
    };

    const validateInputs = () => {
        const errors = {};
        if (new Date(invoiceDate) < new Date(data.salesDate)) {
            errors.invoiceDate = "Tanggal invoice tidak boleh lebih awal dari tanggal sales.";
        }
        if (!paymentTerms || Number(paymentTerms) < 1) {
            errors.paymentTerms = "Jangka waktu pembayaran minimal 1 hari.";
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
                    <h1 className="page-title">Konfirmasi Sales Order</h1>
                </div>

                <div className="detail-card">
                    <div className="section-header"><h2 className="section-title">Informasi Utama</h2></div>
                    <div className="section-content">
                        <div className="detail-row"><span className="detail-label">ID:</span><span className="detail-value">{data.id}</span></div>
                        <div className="detail-row"><span className="detail-label">Customer:</span><span className="detail-value">{customerName}</span></div>
                        <div className="detail-row"><span className="detail-label">Tanggal:</span><span className="detail-value">{formatDate(data.salesDate)}</span></div>
                        <div className="detail-row"><span className="detail-label">Total Harga:</span><span className="detail-value">Rp {parseFloat(data.totalPrice).toLocaleString("id-ID")}</span></div>
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
                                    <th>Gudang Tujuan</th>
                                    <th>Pajak</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.barangId}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.gudangTujuan}</td>
                                        <td>{item.pajak || item.tax || 0}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

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
                                <input type="number" min="1" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
                                {inputErrors.paymentTerms && <span className="error-message">{inputErrors.paymentTerms}</span>}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="form-actions">
                    <button className="cancel-btn" onClick={() => setModalType("cancel")}>Batal</button>
                    <button className="submit-btn" onClick={() => {
                        if (validateInputs()) setModalType("confirm");
                    }}
                    >Konfirmasi</button>
                </div>

                {modalType && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>{modalType === "confirm" ? "Konfirmasi Sales Order" : "Batalkan Konfirmasi"}</h3>
                                <button className="close-button" onClick={() => setModalType(null)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                {modalType === "confirm" ? (
                                    <p>Apakah Anda yakin ingin mengkonfirmasi Sales Order ini?</p>
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
                                        else navigate("/sales-order");
                                    }}
                                >
                                    {modalType === "confirm" ? "Ya, Konfirmasi" : "Ya, Batalkan"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfirmSalesOrder;
