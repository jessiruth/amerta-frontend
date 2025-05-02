import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GudangDetail.css";

const DetailDelivery = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [vendorName, setVendorName] = useState("");
    const [itemPrices, setItemPrices] = useState({});
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

                const customerRes = await axiosInstance.get(`/api/customer/${order.customerId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setVendorName(customerRes.data?.data?.name || "Unknown");

                const prices = {};
                await Promise.all(
                    order.items.map(async (item) => {
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
            } catch {
                alert("Gagal memuat detail Purchase Order");
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

    const handleBack = () => navigate("/delivery-note");

    const getTotal = () =>
        data.items.reduce((total, item) =>
            total + getSubtotal(item.barangId, item.quantity, item.tax), 0);

    if (loading) return <p>Loading...</p>;
    if (!data) return <p>Data tidak ditemukan</p>;

    return (
        <div className="gudang-form-container">
            <div className="gudang-form-content">
                <div className="page-header">
                    <h1 className="page-title">Surat Jalan</h1>
                    <h1 className="page-title">{data.delivery.id}</h1>
                </div>

                <div className="action-buttons">
                    <button className="back-btn" onClick={handleBack}>Kembali</button>
                    <button className="print-btn" onClick={() => window.print()}>Print</button>
                </div>

                <div className="detail-card">
                    <div className="section-header"><h2 className="section-title">Informasi Pengiriman</h2></div>
                    <div className="section-content">
                        <div className="detail-row">
                            <span className="detail-label">Vendor:</span>
                            <span className="detail-value">{vendorName}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Tanggal Pengiriman:</span>
                            <span className="detail-value">{formatDate(data.delivery.deliveryDate)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Nomor Resi:</span>
                            <span className="detail-value">{data.delivery.trackingNumber}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Biaya Kirim:</span>
                            <span className="detail-value">Rp{parseFloat(data.delivery.deliveryFee).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Status Pengiriman:</span>
                            <span className="detail-value">{data.delivery.deliveryStatus}</span>
                        </div>
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
                                    <th>Harga Satuan</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map(item => {
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
            </div>
        </div>
    );
};

export default DetailDelivery;