import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GudangDetail.css";
import "../../styles/AddSalesOrder.css";

const ShippingSalesOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [customerName, setCustomerName] = useState("");
    const [shippingDate, setShippingDate] = useState(new Date().toISOString().split("T")[0]);
    const [shippingFee, setShippingFee] = useState("");
    const [modalType, setModalType] = useState(null);
    const [successModal, setSuccessModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [inputErrors, setInputErrors] = useState({});
    const [stockWarnings, setStockWarnings] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/");

        const fetchData = async () => {
            try {
                const res = await axiosInstance.get(`/api/sales-order/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const soData = res.data?.data;

                // Ambil harga jual barang satu per satu
                const updatedItems = await Promise.all(
                    soData.items.map(async (item) => {
                        try {
                            const barangRes = await axiosInstance.get(`/api/barang/${item.barangId}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            return {
                                ...item,
                                barang: barangRes.data?.data,
                            };
                        } catch {
                            return { ...item };
                        }
                    })
                );

                setData({ ...soData, items: updatedItems });

                const customerRes = await axiosInstance.get(`/api/customer/${soData.customerId}`, {
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

    const validateInputs = async () => {
        const errors = {};
        const token = localStorage.getItem("token");

        if (!shippingFee || Number(shippingFee) < 0) {
            errors.shippingFee = "Biaya kirim harus >= 0";
        }
        if (new Date(shippingDate) < new Date(data.salesDate)) {
            errors.shippingDate = "Tanggal pengiriman tidak boleh sebelum tanggal sales order.";
        }
        if (data.invoice?.invoiceDate && new Date(shippingDate) < new Date(data.invoice.invoiceDate)) {
            errors.shippingDate = "Tanggal pengiriman tidak boleh sebelum tanggal invoice.";
        }

        const warnings = [];
        for (const item of data.items) {
            try {
                const res = await axiosInstance.get(`/api/barang/${item.barangId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const stockData = res.data?.data?.stockBarang || [];
                const stokGudang = stockData.find(s => s.namaGudang === item.gudangTujuan)?.stock || 0;

                if (item.quantity > stokGudang) {
                    warnings.push({
                        barangId: item.barangId,
                        required: item.quantity,
                        available: stokGudang,
                    });
                }
            } catch {
                console.error(`Gagal mengambil stok barang ${item.barangId}`);
            }
        }

        setStockWarnings(warnings);
        setInputErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        try {
            await axiosInstance.put(`/api/sales-order/shipping/${id}`, {
                shippingDate,
                shippingFee: Number(shippingFee),
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setModalType(null);
            setSuccessModal(true);
        } catch {
            alert("Gagal memulai pengiriman.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!data) return <p>Data tidak ditemukan.</p>;

    return (
        <div className="gudang-form-container">
            <div className="gudang-form-content">
                <div className="page-header">
                    <h1 className="page-title">Shipping Sales Order</h1>
                </div>

                {/* Informasi Utama */}
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

                {/* Daftar Item */}
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
                                    <th>Harga Satuan</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((item) => {
                                    const harga = item.barang?.hargaJual || 0;
                                    const qty = item.quantity;
                                    const tax = item.tax || 0;
                                    const subtotal = harga * qty * (1 + tax / 100);
                                    return (
                                        <tr key={item.id}>
                                            <td>{item.barangId}</td>
                                            <td>{qty}</td>
                                            <td>{item.gudangTujuan}</td>
                                            <td>{tax}%</td>
                                            <td>Rp {harga.toLocaleString("id-ID")}</td>
                                            <td>Rp {subtotal.toLocaleString("id-ID")}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "right", fontWeight: "bold" }}>Total</td>
                                    <td style={{ fontWeight: "bold" }}>
                                        Rp {data.items.reduce((total, item) => {
                                            const harga = item.barang?.hargaJual || 0;
                                            const tax = item.tax || 0;
                                            return total + harga * item.quantity * (1 + tax / 100);
                                        }, 0).toLocaleString("id-ID")}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                        {stockWarnings.length > 0 && (
                            <div className="warning-text" style={{ marginTop: "15px", color: "#dd6b20" }}>
                                <strong>Stok tidak mencukupi untuk barang berikut:</strong>
                                <ul style={{ marginTop: "5px" }}>
                                    {stockWarnings.map((w, idx) => (
                                        <li key={idx}>
                                            Barang ID <strong>{w.barangId}</strong> membutuhkan <strong>{w.required}</strong>, hanya tersedia <strong>{w.available}</strong>.
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Faktur */}
                {data.invoice && (
                    <div className="detail-card">
                        <div className="section-header"><h2 className="section-title">Faktur</h2></div>
                        <div className="section-content">
                            <div className="detail-row"><span className="detail-label">Tanggal Invoice:</span><span className="detail-value">{formatDate(data.invoice.invoiceDate)}</span></div>
                            <div className="detail-row"><span className="detail-label">Total Tagihan:</span><span className="detail-value">Rp {parseFloat(data.invoice.totalAmount).toLocaleString("id-ID")}</span></div>
                            <div className="detail-row"><span className="detail-label">Jatuh Tempo:</span><span className="detail-value">{formatDate(data.invoice.dueDate)}</span></div>
                            <div className="detail-row"><span className="detail-label">Status Faktur:</span><span className="detail-value">{data.invoice.invoiceStatus}</span></div>
                        </div>
                    </div>
                )}

                {/* Input Pengiriman */}
                <div className="detail-card">
                    <div className="section-header"><h2 className="section-title">Input Pengiriman</h2></div>
                    <div className="section-content">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Tanggal Pengiriman</label>
                                <input type="date" value={shippingDate} onChange={(e) => setShippingDate(e.target.value)} />
                                {inputErrors.shippingDate && <span className="error-message">{inputErrors.shippingDate}</span>}
                            </div>
                            <div className="form-group">
                                <label>Biaya Kirim</label>
                                <input type="number" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} />
                                {inputErrors.shippingFee && <span className="error-message">{inputErrors.shippingFee}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    {data.status === "CONFIRMED" ? (
                        <>
                            <button className="cancel-btn" onClick={() => setModalType("cancel")}>Batal</button>
                            <button
                                className="submit-btn"
                                onClick={async () => {
                                    const isValid = await validateInputs();
                                    if (isValid) setModalType("confirm");
                                }}
                            >
                                Kirim
                            </button>
                        </>
                    ) : (
                        <button className="cancel-btn" onClick={() => navigate("/shipping")}>Kembali</button>
                    )}
                </div>


                {/* Modal Konfirmasi */}
                {modalType && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>{modalType === "confirm" ? "Konfirmasi Pengiriman" : "Batalkan Proses"}</h3>
                                <button className="close-button" onClick={() => setModalType(null)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                {modalType === "confirm"
                                    ? <p>Apakah Anda yakin ingin memulai pengiriman?</p>
                                    : <>
                                        <p>Apakah Anda yakin ingin membatalkan proses ini?</p>
                                        <p className="warning-text">Semua data input akan hilang.</p>
                                    </>
                                }
                            </div>
                            <div className="modal-footer">
                                <button className="secondary-btn" onClick={() => setModalType(null)}>Kembali</button>
                                <button className={modalType === "confirm" ? "primary-btn" : "danger-btn"}
                                    onClick={() => {
                                        if (modalType === "confirm") handleSubmit();
                                        else navigate("/sales-order");
                                    }}
                                >
                                    {modalType === "confirm" ? "Ya, Kirim" : "Ya, Batalkan"}
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
                                <h3>Pengiriman Dimulai</h3>
                                <button className="close-button" onClick={() => setSuccessModal(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <p>Pengiriman berhasil dimulai. Anda akan diarahkan ke halaman detail sales order.</p>
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

export default ShippingSalesOrder;
