import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navbar";
import "../../styles/AddSalesOrder.css";

const AddSalesOrder = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        salesDate: new Date().toISOString().split("T")[0],
        customerId: "",
        gudangTujuan: "",
        items: []
    });
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [gudangs, setGudangs] = useState([]);
    const [errors, setErrors] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/");
        fetchCustomers(token);
        fetchProducts(token);
        fetchGudangs(token);
    }, [navigate]);

    const fetchCustomers = async (token) => {
        try {
            const res = await axiosInstance.get("/api/customer/viewall", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const filtered = (res.data?.data || []).filter(c => c.role === "CUSTOMER");
            setCustomers(filtered);
        } catch {
            toast.error("Gagal mengambil data customer");
        }
    };

    const fetchProducts = async (token) => {
        try {
            const res = await axiosInstance.get("/api/barang/viewall", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(res.data?.data || []);
        } catch {
            toast.error("Gagal mengambil data barang");
        }
    };

    const fetchGudangs = async (token) => {
        try {
            const res = await axiosInstance.get("/api/gudang/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGudangs(res.data?.data || []);
        } catch {
            toast.error("Gagal mengambil data gudang");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: updatedItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { barangId: "", quantity: 1, pajak: 0 }]
        }));
    };

    const removeItem = (index) => {
        const updated = [...formData.items];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, items: updated }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.salesDate) newErrors.salesDate = "Tanggal wajib diisi";
        if (!formData.customerId) newErrors.customerId = "Customer wajib dipilih";
        if (!formData.gudangTujuan) newErrors.gudangTujuan = "Gudang asal wajib diisi";
        if (formData.items.length === 0) newErrors.items = "Minimal satu item harus ditambahkan";

        formData.items.forEach((item, index) => {
            if (!item.barangId) newErrors[`item-${index}-barangId`] = "Pilih barang";
            const selectedProduct = products.find(p => p.id === item.barangId);
            const stock = selectedProduct?.stockBarang?.find(s => s.namaGudang === formData.gudangTujuan)?.stock || 0;
            if (!item.quantity || isNaN(item.quantity) || Number(item.quantity) <= 0) {
                newErrors[`item-${index}-quantity`] = "Jumlah tidak valid";
            } else if (Number(item.quantity) > stock) {
                newErrors[`item-${index}-quantity`] = "Jumlah melebihi stok";
            }
            if (item.pajak === "" || isNaN(item.pajak) || Number(item.pajak) < 0 || Number(item.pajak) > 100) {
                newErrors[`item-${index}-pajak`] = "Pajak tidak valid (0-100%)";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) setShowConfirmation(true);
        else toast.error("Mohon perbaiki kesalahan pada formulir.");
    };

    const confirmSubmit = async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            const payload = {
                ...formData,
                items: formData.items.map(item => ({
                    ...item,
                    gudangTujuan: formData.gudangTujuan
                }))
            };
            await axiosInstance.post("/api/sales-order/add", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Sales Order berhasil ditambahkan!");
            setTimeout(() => navigate("/sales-order"), 1500);
        } catch {
            toast.error("Gagal menambahkan Sales Order.");
        } finally {
            setLoading(false);
            setShowConfirmation(false);
        }
    };

    return (
        <div className="gudang-form-container">
            <Navbar />
            <ToastContainer />
            <div className="gudang-form-content">
                <div className="page-header">
                    <h1 className="page-title">Tambah Sales Order</h1>
                </div>

                <form onSubmit={handleSubmit} className="form-container">
                    <div className="form-section">
                        <h3>Informasi Umum</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Tanggal Sales</label>
                                <input type="date" name="salesDate" value={formData.salesDate} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Customer</label>
                                <select name="customerId" value={formData.customerId} onChange={handleChange}>
                                    <option value="">Pilih Customer</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.customerId && <span className="error-message">{errors.customerId}</span>}
                            </div>
                            <div className="form-group">
                                <label>Gudang Asal</label>
                                <select name="gudangTujuan" value={formData.gudangTujuan} onChange={handleChange}>
                                    <option value="">Pilih Gudang</option>
                                    {gudangs.map(g => (
                                        <option key={g.nama} value={g.nama}>{g.nama}</option>
                                    ))}
                                </select>
                                {errors.gudangTujuan && <span className="error-message">{errors.gudangTujuan}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Daftar Item</h3>
                        {formData.items.map((item, index) => {
                            const selectedProduct = products.find(p => p.id === item.barangId);
                            const stock = selectedProduct?.stockBarang?.find(s => s.namaGudang === formData.gudangTujuan)?.stock || 0;
                            return (
                                <div key={index} className="form-row item-entry">
                                    <div className="form-group">
                                        <label>Barang</label>
                                        <select value={item.barangId} onChange={(e) => handleItemChange(index, "barangId", e.target.value)}>
                                            <option value="">Pilih Barang</option>
                                            {products
                                                .filter(b => b.stockBarang.some(s => s.namaGudang === formData.gudangTujuan))
                                                .map(b => {
                                                    const stok = b.stockBarang.find(s => s.namaGudang === formData.gudangTujuan)?.stock || 0;
                                                    return <option key={b.id} value={b.id}>{b.nama} (Stok: {stok})</option>;
                                                })}
                                        </select>
                                        {errors[`item-${index}-barangId`] && <span className="error-message">{errors[`item-${index}-barangId`]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Jumlah</label>
                                        <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} />
                                        {errors[`item-${index}-quantity`] && <span className="error-message">{errors[`item-${index}-quantity`]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Pajak (%)</label>
                                        <input type="number" min="0" max="100" value={item.pajak} onChange={(e) => handleItemChange(index, "pajak", e.target.value)} />
                                        {errors[`item-${index}-pajak`] && <span className="error-message">{errors[`item-${index}-pajak`]}</span>}
                                    </div>
                                    <div className="form-group button-group">
                                        <label>&nbsp;</label>
                                        <button type="button" className="hapus-btn" onClick={() => removeItem(index)}>Hapus</button>
                                    </div>
                                </div>
                            );
                        })}
                        <hr style={{ margin: "1rem 0" }} />
                        <button type="button" className="submit-btn full-width" onClick={addItem}>Tambah Barang</button>
                        {errors.items && <span className="error-message">{errors.items}</span>}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => setShowConfirmation("cancel")}>
                            Batal
                        </button>

                        <button type="submit" className="submit-btn" disabled={loading}>Simpan</button>
                    </div>
                </form>

                {showConfirmation && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            {loading ? (
                                <>
                                    <div className="modal-header">
                                        <h3>Menyimpan Data</h3>
                                    </div>
                                    <div className="modal-body">
                                        <div className="loading-indicator">
                                            <div className="loading-spinner"></div>
                                            <p>Sedang menyimpan Sales Order...</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="modal-header">
                                        <h3>{formData.customerId ? "Konfirmasi Sales Order" : "Konfirmasi"}</h3>
                                        <button
                                            className="close-button"
                                            onClick={() => setShowConfirmation(false)}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <p>Apakah Anda yakin ingin {formData.customerId ? `menyimpan Sales Order untuk customer ini?` : 'membatalkan formulir ini'}?</p>
                                        {!formData.customerId && (
                                            <p className="warning-text">Semua data yang telah dimasukkan akan hilang.</p>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            className="secondary-btn"
                                            onClick={() => setShowConfirmation(false)}
                                        >
                                            Kembali
                                        </button>
                                        <button
                                            className={formData.customerId ? "primary-btn" : "danger-btn"}
                                            onClick={formData.customerId ? confirmSubmit : () => navigate("/sales-order")}
                                        >
                                            {formData.customerId ? "Ya, Simpan" : "Ya, Batalkan"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AddSalesOrder;