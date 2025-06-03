import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/AddGoodsAndServices.css";

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
  const [showConfirmation, setShowConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [createdId, setCreatedId] = useState(null);

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
      setCustomers((res.data?.data || []).filter(c => c.role === "CUSTOMER"));
    } catch {}
  };

  const fetchProducts = async (token) => {
    try {
      const res = await axiosInstance.get("/api/barang/viewall", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((res.data?.data || []).filter(p => p.active === true));
    } catch {}
  };

  const fetchGudangs = async (token) => {
    try {
      const res = await axiosInstance.get("/api/gudang/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGudangs(res.data?.data || []);
    } catch {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }

    if (name === "gudangTujuan") {
      const updatedErrors = { ...errors };
      formData.items.forEach((_, idx) => {
        delete updatedErrors[`item-${idx}-quantity`];
        delete updatedErrors[`item-${idx}-pajak`];
        delete updatedErrors[`item-${idx}-barangId`];
      });
      delete updatedErrors.gudangTujuan;
      setErrors(updatedErrors);
    }
  };


 const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: updatedItems }));

    const errKey = `item-${index}-${field}`;
    if (errors[errKey]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[errKey];
        return copy;
      });
    }

    // Hapus error `items` jika user menambah data
    if (errors.items) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.items;
        return copy;
      });
    }
  };


  const addItem = () => {
    setFormData(prev => {
      const updatedItems = [...prev.items, { barangId: "", quantity: "", pajak: "" }];

      // Hapus error 'items' jika ada
      if (errors.items) {
        setErrors(prevErrors => {
          const copy = { ...prevErrors };
          delete copy.items;
          return copy;
        });
      }

      return { ...prev, items: updatedItems };
    });
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
        newErrors[`item-${index}-quantity`] = "Jumlah minimal 1";
        } else if (Number(item.quantity) > stock) {
        newErrors[`item-${index}-quantity`] = "Jumlah melebihi stok";
        }
        if (item.pajak === "" || isNaN(item.pajak) || Number(item.pajak) < 0 || Number(item.pajak) > 100) {
        newErrors[`item-${index}-pajak`] = "Pajak tidak valid (0-100%)";
        }
    });

    const pajakMap = new Map();
    formData.items.forEach((item, index) => {
        const key = `${item.barangId}-${formData.gudangTujuan}`;
        if (item.barangId && formData.gudangTujuan !== "") {
        if (pajakMap.has(key) && pajakMap.get(key) !== item.pajak) {
            newErrors[`item-${index}-pajak`] = "Pajak harus konsisten";
        }
        pajakMap.set(key, item.pajak);
        }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
    };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) setShowConfirmation("submit");
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
      const response = await axiosInstance.post("/api/sales-order/add", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCreatedId(response.data?.data?.id);
      setSuccessModal(true);
      setShowConfirmation(null);
    } catch {
      alert("Gagal menyimpan Sales Order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="barang-form-container">
      <div className="barang-page-header">
        <h1 className="barang-page-title">Tambah Sales Order</h1>
      </div>
      <div className="barang-form-content">
        <form onSubmit={handleSubmit}>
          <div className="barang-form-section">
            <h3>Informasi Umum</h3>
            <div className="barang-form-group">
              <label>Tanggal Sales<span className="required">*</span></label>
              <input type="date" name="salesDate" value={formData.salesDate} onChange={handleChange} />
            </div>
            <div className="barang-form-group">
              <label>Customer<span className="required">*</span></label>
              <select name="customerId" value={formData.customerId} onChange={handleChange}>
                <option value="">Pilih Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.customerId && <div className="barang-error">{errors.customerId}</div>}
            </div>
            <div className="barang-form-group">
              <label>Gudang Asal<span className="required">*</span></label>
              <select name="gudangTujuan" value={formData.gudangTujuan} onChange={handleChange}>
                <option value="">Pilih Gudang</option>
                {gudangs.map(g => (
                  <option key={g.nama} value={g.nama}>{g.nama}</option>
                ))}
              </select>
              {errors.gudangTujuan && <div className="barang-error">{errors.gudangTujuan}</div>}
            </div>
          </div>

          <div className="barang-form-section">
            <h3>Daftar Barang</h3>
            <button type="button" className="barang-add-btn" onClick={addItem}>+ Tambah Barang</button>
            {errors.items && <div className="barang-error">{errors.items}</div>}

            <div className="barang-stock-table-wrapper">
              {formData.items.length > 0 && (
                <table className="purchase-stock-table">
                  <thead>
                    <tr>
                      <th>Barang<span className="required">*</span></th>
                      <th>Jumlah<span className="required">*</span></th>
                      <th>Pajak (%)<span className="required">*</span></th>
                      <th>Hapus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <select value={item.barangId} onChange={(e) => handleItemChange(index, "barangId", e.target.value)}>
                            <option value="">Pilih Barang</option>
                            {products
                              .filter(b => b.stockBarang.some(s => s.namaGudang === formData.gudangTujuan))
                              .map(b => {
                                const stok = b.stockBarang.find(s => s.namaGudang === formData.gudangTujuan)?.stock || 0;
                                return <option key={b.id} value={b.id}>{b.nama} (Stok: {stok})</option>;
                              })}
                          </select>
                          {errors[`item-${index}-barangId`] && <div className="barang-error">{errors[`item-${index}-barangId`]}</div>}
                        </td>
                        <td>
                          <input type="number" min="0" placeholder="Contoh: 35" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} />
                          {errors[`item-${index}-quantity`] && <div className="barang-error">{errors[`item-${index}-quantity`]}</div>}
                        </td>
                        <td>
                          <input type="number" min="0" max="100" placeholder="Contoh: 5" value={item.pajak} onChange={(e) => handleItemChange(index, "pajak", e.target.value)} />
                          {errors[`item-${index}-pajak`] && <div className="barang-error">{errors[`item-${index}-pajak`]}</div>}
                        </td>
                        <td>
                          <button type="button" className="barang-delete-button" onClick={() => removeItem(index)}>
                            <DeleteIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="barang-actions">
            <button type="button" className="barang-cancel-btn" onClick={() => setShowConfirmation("cancel")}>Batal</button>
            <button type="submit" className="barang-submit-btn" disabled={loading}>Simpan</button>
          </div>
        </form>

        {showConfirmation && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{showConfirmation === "submit" ? "Konfirmasi Simpan" : "Konfirmasi Batal"}</h3>
                <button className="close-button" onClick={() => setShowConfirmation(null)}>&times;</button>
              </div>
              <div className="modal-body">
                {showConfirmation === "submit" ? (
                  <p>Apakah Anda yakin ingin menyimpan Sales Order ini?</p>
                ) : (
                  <>
                    <p>Apakah Anda yakin ingin membatalkan formulir ini?</p>
                    <p className="warning-text">Semua data yang telah dimasukkan akan hilang.</p>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="secondary-btn" onClick={() => setShowConfirmation(null)}>Kembali</button>
                <button className={showConfirmation === "submit" ? "primary-btn" : "danger-btn"}
                  onClick={showConfirmation === "submit"
                    ? confirmSubmit
                    : () => navigate("/sales/completed")}>
                  {showConfirmation === "submit" ? "Ya, Simpan" : "Ya, Batalkan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {successModal && createdId && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Sales Order Disimpan</h3>
                <button className="close-button" onClick={() => setSuccessModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <p>Sales Order berhasil disimpan.</p>
              </div>
              <div className="modal-footer">
                <button className="primary-btn" onClick={() => navigate(`/sales/completed/detail/${createdId}`)}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSalesOrder;
