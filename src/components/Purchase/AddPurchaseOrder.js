import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navbar";
import "../../styles/AddSalesOrder.css";

const AddPurchaseOrder = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        purchaseDate: new Date().toISOString().split("T")[0],
        customerId: "",
        items: []
    });
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [availableGudangPerItem, setAvailableGudangPerItem] = useState([]);
    const [errors, setErrors] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/");
        fetchCustomers(token);
        fetchProducts(token);
    }, [navigate]);

    const fetchCustomers = async (token) => {
        try {
            const res = await axiosInstance.get("/api/customer/viewall", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const filtered = (res.data?.data || []).filter(c => c.role === "VENDOR");
            setCustomers(filtered);
        } catch {
            toast.error("Gagal mengambil data vendor");
        }
    };

    const fetchProducts = async (token) => {
        try {
            const res = await axiosInstance.get("/api/barang/viewall", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const filtered = (res.data?.data || []).filter(p => p.active === true);
            setProducts(filtered);
        } catch {
            toast.error("Gagal mengambil data barang");
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

        if (field === "barangId") fetchGudangsForItem(index, value);
    };

    const fetchGudangsForItem = async (index, barangId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axiosInstance.get(`/api/barang/all-gudang/${barangId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const namaGudang = res.data?.data?.namaGudang || [];
            setAvailableGudangPerItem(prev => {
                const updated = [...prev];
                updated[index] = namaGudang;
                return updated;
            });
        } catch {
            toast.error("Gagal mengambil gudang untuk barang ini.");
        }
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { barangId: "", quantity: 1, pajak: 0, gudangTujuan: "" }]
        }));
        setAvailableGudangPerItem(prev => [...prev, []]);
    };

    const removeItem = (index) => {
        const updatedItems = [...formData.items];
        const updatedGudangs = [...availableGudangPerItem];
        updatedItems.splice(index, 1);
        updatedGudangs.splice(index, 1);
        setFormData(prev => ({ ...prev, items: updatedItems }));
        setAvailableGudangPerItem(updatedGudangs);
    };

    const validateForm = () => {
        const newErrors = {};
        const comboPajak = new Map();

        if (!formData.purchaseDate) newErrors.purchaseDate = "Tanggal wajib diisi";
        if (!formData.customerId) newErrors.customerId = "Supplier wajib dipilih";
        if (formData.items.length === 0) newErrors.items = "Minimal satu item harus ditambahkan";

        formData.items.forEach((item, index) => {
            if (!item.barangId) newErrors[`item-${index}-barangId`] = "Pilih barang";
            if (!item.quantity || isNaN(item.quantity) || Number(item.quantity) <= 0) {
                newErrors[`item-${index}-quantity`] = "Jumlah tidak valid";
            }
            if (!item.gudangTujuan) {
                newErrors[`item-${index}-gudangTujuan`] = "Gudang wajib dipilih";
            }
            if (item.pajak === "" || isNaN(item.pajak) || Number(item.pajak) < 0 || Number(item.pajak) > 100) {
                newErrors[`item-${index}-pajak`] = "Pajak tidak valid (0-100%)";
            }

            // Cek jika barang + gudangTujuan sudah ada, maka pajak harus sama
            const key = `${item.barangId}-${item.gudangTujuan}`;
            const existing = comboPajak.get(key);
            if (existing !== undefined && Number(existing) !== Number(item.pajak)) {
                newErrors[`item-${index}-pajak`] = "Pajak harus sama untuk barang dan gudang yang sama.";
            } else {
                comboPajak.set(key, item.pajak);
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setShowConfirmation("submit");
        } else {
            toast.error("Mohon perbaiki kesalahan pada formulir.");
        }
    };

    const confirmSubmit = async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            const response = await axiosInstance.post("/api/purchase-order/add", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const newId = response.data?.data?.id;
            toast.success("Purchase Order berhasil ditambahkan!");
            setTimeout(() => {
                navigate(`/purchase-order/detail/${newId}`);
            }, 1500);
        } catch {
            toast.error("Gagal menambahkan Purchase Order.");
        } finally {
            setLoading(false);
            setShowConfirmation(null);
        }
    };

    return (
        <div className="gudang-form-container">
            <Navbar />
            <ToastContainer />
            <div className="gudang-form-content">
                <div className="page-header">
                    <h1 className="page-title">Tambah Purchase Order</h1>
                </div>

                <form onSubmit={handleSubmit} className="form-container">
                    <div className="form-section">
                        <h3>Informasi Umum</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Tanggal Beli</label>
                                <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Vendor</label>
                                <select name="customerId" value={formData.customerId} onChange={handleChange}>
                                    <option value="">Pilih Vendor</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.customerId && <span className="error-message">{errors.customerId}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Daftar Item</h3>
                        {formData.items.map((item, index) => (
                            <div key={index} className="form-row item-entry">
                                <div className="form-group">
                                    <label>Barang</label>
                                    <select value={item.barangId} onChange={(e) => handleItemChange(index, "barangId", e.target.value)}>
                                        <option value="">Pilih Barang</option>
                                        {products.map(b => (
                                            <option key={b.id} value={b.id}>{b.nama} ({b.merk})</option>
                                        ))}
                                    </select>
                                    {errors[`item-${index}-barangId`] && <span className="error-message">{errors[`item-${index}-barangId`]}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Jumlah</label>
                                    <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} />
                                    {errors[`item-${index}-quantity`] && <span className="error-message">{errors[`item-${index}-quantity`]}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Gudang</label>
                                    <select value={item.gudangTujuan} onChange={(e) => handleItemChange(index, "gudangTujuan", e.target.value)}>
                                        <option value="">Pilih Gudang</option>
                                        {(availableGudangPerItem[index] || []).map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                    {errors[`item-${index}-gudangTujuan`] && <span className="error-message">{errors[`item-${index}-gudangTujuan`]}</span>}
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
                        ))}
                        <hr />
                        <button type="button" className="submit-btn full-width" onClick={addItem}>Tambah Barang</button>
                        {errors.items && <span className="error-message">{errors.items}</span>}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => setShowConfirmation("cancel")}>Batal</button>
                        <button type="submit" className="submit-btn" disabled={loading}>Simpan</button>
                    </div>
                </form>

                {showConfirmation && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            {loading ? (
                                <>
                                    <div className="modal-header"><h3>Menyimpan Data</h3></div>
                                    <div className="modal-body">
                                        <div className="loading-indicator">
                                            <div className="loading-spinner"></div>
                                            <p>Sedang menyimpan Purchase Order...</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="modal-header">
                                        <h3>{showConfirmation === "submit" ? "Konfirmasi Purchase Order" : "Konfirmasi Batal"}</h3>
                                        <button className="close-button" onClick={() => setShowConfirmation(null)}>&times;</button>
                                    </div>
                                    <div className="modal-body">
                                        {showConfirmation === "submit" ? (
                                            <p>Apakah Anda yakin ingin menyimpan Purchase Order ini?</p>
                                        ) : (
                                            <>
                                                <p>Apakah Anda yakin ingin membatalkan formulir ini?</p>
                                                <p className="warning-text">Semua data yang telah dimasukkan akan hilang.</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        <button className="secondary-btn" onClick={() => setShowConfirmation(null)}>Kembali</button>
                                        <button
                                            className={showConfirmation === "submit" ? "primary-btn" : "danger-btn"}
                                            onClick={showConfirmation === "submit" ? confirmSubmit : () => navigate("/purchase-order")}
                                        >
                                            {showConfirmation === "submit" ? "Ya, Simpan" : "Ya, Batalkan"}
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

export default AddPurchaseOrder;
