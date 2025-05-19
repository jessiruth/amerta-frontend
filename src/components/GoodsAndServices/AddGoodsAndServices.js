import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/AddGoodsAndServices.css";

const AddGoodsAndServices = () => {
  const navigate = useNavigate();
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [merk, setMerk] = useState("");
  const [isActive, setIsActive] = useState(null);
  const [hargaBeli, setHargaBeli] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [stokList, setStokList] = useState([]);
  const [gudangOptions, setGudangOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    const fetchGudangs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/gudang/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGudangOptions(res.data.data.map(g => g.nama));
      } catch {
        setErrors({ general: "Gagal mengambil gudang." });
      }
    };
    fetchGudangs();
  }, []);

  const parseHarga = (str) => parseFloat(str.replace(",", "."));

  const validateForm = () => {
    const newErr = {};
    const hargaRegex = /^\d+(,\d{1,2})?$/;

    const beliValid = hargaRegex.test(hargaBeli);
    const jualValid = hargaRegex.test(hargaJual);

    const beli = parseHarga(hargaBeli);
    const jual = parseHarga(hargaJual);

    if (!nama.trim()) newErr.nama = "Nama wajib diisi";
    if (!kategori.trim()) newErr.kategori = "Kategori wajib diisi";
    if (!merk.trim()) newErr.merk = "Merk wajib diisi";

    if (!hargaBeli) newErr.hargaBeli = "Harga beli wajib diisi";
    else if (!beliValid) newErr.hargaBeli = "Gunakan format koma, contoh: 12500,50";
    else if (beli < 1) newErr.hargaBeli = "Harga beli minimal 1";

    if (!hargaJual) newErr.hargaJual = "Harga jual wajib diisi";
    else if (!jualValid) newErr.hargaJual = "Gunakan format koma, contoh: 15000,75";
    else if (jual < 1) newErr.hargaJual = "Harga jual minimal 1";

    if (isActive === null) newErr.isActive = "Status barang wajib dipilih";

    if (stokList.length === 0) newErr.stokList = "Minimal harus ada satu stok barang";

    stokList.forEach((s, idx) => {
      if (!s.stock || isNaN(s.stock) || Number(s.stock) < 0) {
        newErr[`stock-${idx}`] = "Jumlah stock tidak valid";
      }
      if (!s.namaGudang) {
        newErr[`gudang-${idx}`] = "Gudang wajib dipilih";
      }
    });

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) setShowModal("confirm");
  };

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post("/api/barang/add", {
        nama,
        kategori,
        merk,
        active: isActive,
        hargaBeli: parseHarga(hargaBeli),
        hargaJual: parseHarga(hargaJual),
        listStockBarang: stokList.map(s => ({
          stock: Number(s.stock),
          namaGudang: s.namaGudang
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const id = res.data.data?.id;
      setSavedId(id);
      setShowSuccessModal(true);
    } catch {
      setErrors({ general: "Gagal menyimpan barang." });
    } finally {
      setShowModal(null);
    }
  };

  const addStock = () => {
    setStokList(prev => [...prev, { stock: "", namaGudang: "" }]);
  };

  const removeStock = index => {
    const updated = [...stokList];
    updated.splice(index, 1);
    setStokList(updated);
  };

  const updateStock = (index, field, value) => {
    const updated = [...stokList];
    updated[index][field] = value;
    setStokList(updated);

    const errKey = `${field === "stock" ? "stock" : "gudang"}-${index}`;
    if (errors[errKey]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[errKey];
        return copy;
      });
    }
  };

  return (
    <div className="barang-form-container">
      <div className="barang-page-header">
        <h1 className="barang-page-title">Tambah Barang</h1>
      </div>
      <div className="barang-form-content">
        <form onSubmit={handleSubmit}>
          <div className="barang-form-section">
            <h3>Informasi Umum</h3>
            <div className="barang-form-group">
              <label>Nama Barang<span className="required">*</span></label>
              <input type="text" value={nama} placeholder="Masukkan nama barang" onChange={e => setNama(e.target.value)} />
              {errors.nama && <div className="barang-error">{errors.nama}</div>}
            </div>
            <div className="barang-form-group">
              <label>Kategori<span className="required">*</span></label>
              <input type="text" value={kategori} placeholder="Masukkan kategori barang" onChange={e => setKategori(e.target.value)} />
              {errors.kategori && <div className="barang-error">{errors.kategori}</div>}
            </div>
            <div className="barang-form-group">
              <label>Merk<span className="required">*</span></label>
              <input type="text" value={merk} placeholder="Masukkan merk barang" onChange={e => setMerk(e.target.value)} />
              {errors.merk && <div className="barang-error">{errors.merk}</div>}
            </div>
            <div className="barang-form-group">
              <label>Harga Beli<span className="required">*</span></label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Contoh: 12500,50"
                value={hargaBeli}
                onChange={e => setHargaBeli(e.target.value)}
              />
              {errors.hargaBeli && <div className="barang-error">{errors.hargaBeli}</div>}
            </div>
            <div className="barang-form-group">
              <label>Harga Jual<span className="required">*</span></label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Contoh: 15000,75"
                value={hargaJual}
                onChange={e => setHargaJual(e.target.value)}
              />
              {errors.hargaJual && <div className="barang-error">{errors.hargaJual}</div>}
            </div>
            <div className="barang-form-group">
              <label>Status Barang<span className="required">*</span></label>
              <div className="barang-radio-group">
                <label><input type="radio" checked={isActive === true} onChange={() => setIsActive(true)} /> Aktif</label>
                <label><input type="radio" checked={isActive === false} onChange={() => setIsActive(false)} /> Tidak Aktif</label>
              </div>
              {errors.isActive && <div className="barang-error">{errors.isActive}</div>}
            </div>
          </div>

          <div className="barang-form-section">
            <h3>Stock per Gudang</h3>
            <button type="button" className="barang-add-btn" onClick={addStock}>+ Tambah Barang</button>
            {errors.stokList && <div className="barang-error">{errors.stokList}</div>}

            <div className="barang-stock-table-wrapper">
              {stokList.length > 0 && (
                <table className="barang-stock-table">
                  <thead>
                    <tr>
                      <th>Jumlah</th>
                      <th>Gudang</th>
                      <th>Hapus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stokList.map((s, idx) => (
                      <tr key={idx}>
                        <td>
                          <input type="number" placeholder="Jumlah" value={s.stock} min="0"
                            onChange={e => updateStock(idx, "stock", e.target.value)} />
                          {errors[`stock-${idx}`] && <div className="barang-error">{errors[`stock-${idx}`]}</div>}
                        </td>
                        <td>
                          <select value={s.namaGudang} onChange={e => updateStock(idx, "namaGudang", e.target.value)}>
                            <option value="">Pilih Gudang</option>
                            {gudangOptions.map((g, i) => <option key={i} value={g}>{g}</option>)}
                          </select>
                          {errors[`gudang-${idx}`] && <div className="barang-error">{errors[`gudang-${idx}`]}</div>}
                        </td>
                        <td>
                          <button type="button" className="barang-delete-button" onClick={() => removeStock(idx)}>
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
            <button type="button" className="barang-cancel-btn" onClick={() => setShowModal("cancel")}>Batal</button>
            <button type="submit" className="barang-submit-btn">Simpan</button>
          </div>
        </form>
      </div>

      {/* Modal Konfirmasi & Batal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{showModal === "confirm" ? "Konfirmasi Simpan" : "Konfirmasi Batal"}</h3>
              <button className="close-button" onClick={() => setShowModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {showModal === "confirm" ? (
                <p>Apakah Anda yakin ingin menyimpan barang ini?</p>
              ) : (
                <>
                  <p>Apakah Anda yakin ingin membatalkan penambahan barang?</p>
                  <p className="warning-text">Semua data yang telah dimasukkan akan hilang.</p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowModal(null)}>Kembali</button>
              <button
                className={showModal === "confirm" ? "primary-btn" : "danger-btn"}
                onClick={() => showModal === "confirm"
                  ? handleConfirm()
                  : navigate("/goods-and-services")}
              >
                {showModal === "confirm" ? "Ya, Simpan" : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Barang Ditambahkan</h3>
              <button className="close-button" onClick={() => setShowSuccessModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Barang berhasil ditambahkan. Anda akan diarahkan ke detail barang.</p>
            </div>
            <div className="modal-footer">
              <button
                className="primary-btn"
                onClick={() => navigate(`/goods-and-services/${savedId}`)}
              >
                Lihat Barang
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AddGoodsAndServices;
