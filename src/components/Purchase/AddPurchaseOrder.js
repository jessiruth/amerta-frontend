// import ...
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/AddGoodsAndServices.css";

const AddPurchaseOrder = () => {
  const navigate = useNavigate();
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [availableGudangPerItem, setAvailableGudangPerItem] = useState([]);
  const [errors, setErrors] = useState({});
  const [modalType, setModalType] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    const fetchData = async () => {
      try {
        const cust = await axiosInstance.get("/api/customer/viewall", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomers(cust.data.data.filter(c => c.role === "VENDOR"));

        const prod = await axiosInstance.get("/api/barang/viewall", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(prod.data.data.filter(p => p.active));
      } catch {
        setErrors({ general: "Gagal mengambil data awal" });
      }
    };

    fetchData();
  }, [navigate]);

  const fetchGudangFor = async (index, barangId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get(`/api/barang/all-gudang/${barangId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data?.data?.namaGudang || [];
      setAvailableGudangPerItem(prev => {
        const copy = [...prev];
        copy[index] = list;
        return copy;
      });

      if (items[index]?.gudangTujuan && list.includes(items[index].gudangTujuan)) {
        setErrors(prev => {
          const copy = { ...prev };
          delete copy[`gudang-${index}`];
          return copy;
        });
      }
    } catch {}
  };

  const validateForm = () => {
    const newErr = {};
    const today = new Date().toISOString().split("T")[0];
    if (!purchaseDate) newErr.purchaseDate = "Tanggal wajib diisi";
    else if (purchaseDate < today) newErr.purchaseDate = "Tanggal tidak boleh lebih awal dari hari ini";
    if (!customerId) newErr.customerId = "Vendor wajib diisi";
    if (items.length === 0) newErr.items = "Minimal satu item harus ditambahkan";

    const combo = new Map();
    items.forEach((item, i) => {
      if (!item.barangId) newErr[`barang-${i}`] = "Pilih barang";
      if (!item.quantity || isNaN(item.quantity) || Number(item.quantity) < 1)
        newErr[`quantity-${i}`] = "Jumlah minimal 1";
      if (!item.gudangTujuan) newErr[`gudang-${i}`] = "Pilih gudang";
      if (item.pajak === "" || Number(item.pajak) < 0 || Number(item.pajak) > 100)
        newErr[`pajak-${i}`] = "Pajak tidak valid (0-100%)";

      const key = `${item.barangId}-${item.gudangTujuan}`;
      if (combo.has(key) && combo.get(key) !== item.pajak)
        newErr[`pajak-${i}`] = "Pajak harus konsisten";
      combo.set(key, item.pajak);
    });

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) setModalType("confirm");
  };

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post("/api/purchase-order/add", {
        purchaseDate,
        customerId,
        items: items.map(it => ({
          ...it,
          quantity: Number(it.quantity),
          pajak: Number(it.pajak)
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const id = res.data?.data?.id;
      setCreatedId(id);
      setSuccessModal(true);
      setModalType(null);
    } catch {
      setModalType(null);
      alert("Gagal menyimpan Purchase Order");
    }
  };

  const addItem = () => {
    setItems(prev => {
      const updated = [...prev, { barangId: "", quantity: "", pajak: "", gudangTujuan: "" }];
      setAvailableGudangPerItem(g => [...g, []]);
      if (errors.items) {
        const copy = { ...errors };
        delete copy.items;
        setErrors(copy);
      }
      return updated;
    });
  };

  const removeItem = index => {
    const updated = [...items];
    updated.splice(index, 1);
    const gudangs = [...availableGudangPerItem];
    gudangs.splice(index, 1);
    setItems(updated);
    setAvailableGudangPerItem(gudangs);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);

    const errKey = `${field === "barangId" ? "barang" : field}-${index}`;
    if (errors[errKey]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[errKey];
        return copy;
      });
    }

    if (errors.items && field === "barangId") {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.items;
        return copy;
      });
    }

    if (field === "gudangTujuan" && value) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[`gudang-${index}`];
        return copy;
      });
    }

    if (field === "barangId") {
      fetchGudangFor(index, value);
    }
  };


  const handleChangeField = (field, value) => {
    if (field === "purchaseDate") setPurchaseDate(value);
    if (field === "customerId") setCustomerId(value);

    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  return (
    <div className="barang-form-container">
      <div className="barang-page-header">
        <h1 className="barang-page-title">Tambah Purchase Order</h1>
      </div>
      <div className="barang-form-content">
        <form onSubmit={handleSubmit}>
          <div className="barang-form-section">
            <h3>Informasi Umum</h3>
            <div className="barang-form-group">
              <label>Tanggal Pembelian<span className="required">*</span></label>
              <input type="date" value={purchaseDate} onChange={e => handleChangeField("purchaseDate", e.target.value)} />
              {errors.purchaseDate && <div className="barang-error">{errors.purchaseDate}</div>}
            </div>
            <div className="barang-form-group">
              <label>Vendor<span className="required">*</span></label>
              <select value={customerId} onChange={e => handleChangeField("customerId", e.target.value)}>
                <option value="">Pilih Vendor</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.customerId && <div className="barang-error">{errors.customerId}</div>}
            </div>
          </div>

          <div className="barang-form-section">
            <h3>Daftar Barang</h3>
            <button type="button" className="barang-add-btn" onClick={addItem}>+ Tambah Barang</button>
            {errors.items && <div className="barang-error">{errors.items}</div>}

            <div className="barang-stock-table-wrapper">
              {items.length > 0 && (
                <table className="purchase-stock-table">
                  <thead>
                    <tr>
                      <th>Barang*</th>
                      <th>Jumlah*</th>
                      <th>Gudang*</th>
                      <th>Pajak (%) *</th>
                      <th>Hapus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <select value={it.barangId} onChange={e => handleItemChange(idx, "barangId", e.target.value)}>
                            <option value="">Pilih Barang</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.nama} ({p.merk})</option>
                            ))}
                          </select>
                          {errors[`barang-${idx}`] && <div className="barang-error">{errors[`barang-${idx}`]}</div>}
                        </td>
                        <td>
                          <input type="number" value={it.quantity} min="0" placeholder="Contoh: 35" onChange={e => handleItemChange(idx, "quantity", e.target.value)} />
                          {errors[`quantity-${idx}`] && <div className="barang-error">{errors[`quantity-${idx}`]}</div>}
                        </td>
                        <td>
                          <select
                            value={availableGudangPerItem[idx]?.includes(it.gudangTujuan) ? it.gudangTujuan : ""}
                            onChange={e => handleItemChange(idx, "gudangTujuan", e.target.value)}
                          >
                            <option value="">Pilih Gudang</option>
                            {(availableGudangPerItem[idx] || []).map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                          {errors[`gudang-${idx}`] && <div className="barang-error">{errors[`gudang-${idx}`]}</div>}
                        </td>
                        <td>
                          <input type="number" value={it.pajak} min="0" max="100" placeholder="Contoh: 5" onChange={e => handleItemChange(idx, "pajak", e.target.value)} />
                          {errors[`pajak-${idx}`] && <div className="barang-error">{errors[`pajak-${idx}`]}</div>}
                        </td>
                        <td>
                          <button type="button" className="barang-delete-button" onClick={() => removeItem(idx)}>
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
            <button type="button" className="barang-cancel-btn" onClick={() => setModalType("cancel")}>Batal</button>
            <button type="submit" className="barang-submit-btn">Simpan</button>
          </div>
        </form>
      </div>

     {modalType && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalType === "confirm" ? "Konfirmasi Simpan" : "Konfirmasi Batal"}</h3>
              <button className="close-button" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {modalType === "confirm" ? (
                <p>Apakah Anda yakin ingin menyimpan Purchase Order ini?</p>
              ) : (
                <>
                  <p>Apakah Anda yakin ingin membatalkan penambahan?</p>
                  <p className="warning-text">Semua data yang telah dimasukkan akan hilang.</p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setModalType(null)}>Kembali</button>
              <button
                className={modalType === "confirm" ? "primary-btn" : "danger-btn"}
                onClick={() => modalType === "confirm"
                  ? handleConfirm()
                  : navigate("/purchase/completed")}
              >
                {modalType === "confirm" ? "Ya, Simpan" : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successModal && createdId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Purchase Order Disimpan</h3>
              <button className="close-button" onClick={() => setSuccessModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Purchase Order berhasil disimpan.</p>
            </div>
            <div className="modal-footer">
              <button className="primary-btn" onClick={() => navigate(`/purchase/completed/detail/${createdId}`)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPurchaseOrder;