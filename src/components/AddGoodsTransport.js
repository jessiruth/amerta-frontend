import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../services/axiosInstance";
import "../styles/AddGoodsAndServices.css";

const AddGoodsTransport = () => {
  const navigate = useNavigate();
  const [gudangList, setGudangList] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [selectedGudangAsal, setSelectedGudangAsal] = useState("");
  const [selectedGudangTujuan, setSelectedGudangTujuan] = useState("");
  const [barangTransfer, setBarangTransfer] = useState([]);
  const [tanggalPemindahan, setTanggalPemindahan] = useState(new Date().toISOString().split("T")[0]);
  const [errors, setErrors] = useState({});
  const [modalType, setModalType] = useState(null);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    const fetchData = async () => {
      try {
        const [gudangRes, barangRes] = await Promise.all([
          axiosInstance.get("/api/gudang/", { headers: { Authorization: `Bearer ${token}` } }),
          axiosInstance.get("/api/barang/viewall", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setGudangList(gudangRes.data.data);
        setBarangList(barangRes.data.data);
      } catch {
        alert("Gagal memuat data gudang/barang.");
      }
    };
    fetchData();
  }, [navigate]);

  const handleChange = (field, value) => {
    if (field === "tanggalPemindahan") setTanggalPemindahan(value);
    if (field === "gudangAsal") setSelectedGudangAsal(value);
    if (field === "gudangTujuan") setSelectedGudangTujuan(value);

    if (errors[field]) {
      const copy = { ...errors };
      delete copy[field];
      setErrors(copy);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...barangTransfer];
    updated[index][field] = value;
    setBarangTransfer(updated);

    const errKey = `${field}-${index}`;
    if (errors[errKey]) {
      const copy = { ...errors };
      delete copy[errKey];
      setErrors(copy);
    }
  };

  const addItem = () => {
    setBarangTransfer(prev => [...prev, { id: "", jumlah: "" }]);
    if (errors.items) {
      const copy = { ...errors };
      delete copy.items;
      setErrors(copy);
    }
  };

  const removeItem = index => {
    const updated = [...barangTransfer];
    updated.splice(index, 1);
    setBarangTransfer(updated);
  };

  const validateForm = () => {
    const newErr = {};
    if (!selectedGudangAsal) {
        newErr.gudangAsal = "Gudang asal wajib dipilih";
    }
    if (!selectedGudangTujuan) {
        newErr.gudangTujuan = "Gudang tujuan wajib dipilih";
    }
    else if (selectedGudangAsal === selectedGudangTujuan){
        newErr.gudangTujuan = "Gudang asal dan tujuan tidak boleh sama";
    } 
    
    if (barangTransfer.length === 0) newErr.items = "Minimal satu barang harus ditambahkan";

    barangTransfer.forEach((item, idx) => {
      if (!item.id) newErr[`id-${idx}`] = "Pilih barang";
      if (!item.jumlah || isNaN(item.jumlah) || Number(item.jumlah) < 1) {
        newErr[`jumlah-${idx}`] = "Jumlah minimal 1";
      }
    });

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) setModalType("confirm");
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axiosInstance.post("/api/barang/transfer", {
        tanggalPemindahan,
        gudangAsal: selectedGudangAsal,
        gudangTujuan: selectedGudangTujuan,
        listBarang: barangTransfer.map(item => ({
          id: item.id,
          jumlah: Number(item.jumlah)
        })),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200 || res.status === 201) {
        setSuccessModal(true);
        setModalType(null);
      }
    } catch {
      alert("Gagal menyimpan data.");
      setModalType(null);
    }
  };

  return (
    <div className="barang-form-container">
      <div className="barang-page-header">
        <h1 className="barang-page-title">Tambah Pemindahan Barang</h1>
      </div>
      <div className="barang-form-content">
        <form onSubmit={handleSubmit}>
          <div className="barang-form-section">
            <h3>Informasi Umum</h3>

            <div className="barang-form-group">
              <label>Tanggal Pemindahan<span className="required">*</span></label>
              <input type="date" value={tanggalPemindahan} onChange={e => handleChange("tanggalPemindahan", e.target.value)} />
            </div>
            <div className="barang-form-group">
              <label>Gudang Asal<span className="required">*</span></label>
              <select value={selectedGudangAsal} onChange={e => handleChange("gudangAsal", e.target.value)}>
                <option value="">Pilih Gudang</option>
                {gudangList.map(g => <option key={g.nama} value={g.nama}>{g.nama}</option>)}
              </select>
              {errors.gudangAsal && <div className="barang-error">{errors.gudangAsal}</div>}
            </div>
            <div className="barang-form-group">
              <label>Gudang Tujuan<span className="required">*</span></label>
              <select value={selectedGudangTujuan} onChange={e => handleChange("gudangTujuan", e.target.value)}>
                <option value="">Pilih Gudang</option>
                {gudangList.map(g => <option key={g.nama} value={g.nama}>{g.nama}</option>)}
              </select>
              {errors.gudangTujuan && <div className="barang-error">{errors.gudangTujuan}</div>}
            </div>
          </div>

          <div className="barang-form-section">
            <h3>Daftar Barang</h3>
            <button type="button" className="barang-add-btn" onClick={addItem}>+ Tambah Barang</button>
            {errors.items && <div className="barang-error">{errors.items}</div>}

            <div className="barang-stock-table-wrapper">
              {barangTransfer.length > 0 && (
                <table className="purchase-stock-table">
                  <thead>
                    <tr>
                      <th>Barang</th>
                      <th>Jumlah</th>
                      <th>Hapus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barangTransfer.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <select value={item.id} onChange={e => handleItemChange(idx, "id", e.target.value)}>
                            <option value="">Pilih Barang</option>
                            {barangList
                              .filter(b => b.stockBarang.some(s => s.namaGudang === selectedGudangAsal))
                              .map(b => {
                                const stok = b.stockBarang.find(s => s.namaGudang === selectedGudangAsal)?.stock || 0;
                                return (
                                  <option key={b.id} value={b.id}>
                                    {b.nama} (Stok: {stok})
                                  </option>
                                );
                              })}
                          </select>
                          {errors[`id-${idx}`] && <div className="barang-error">{errors[`id-${idx}`]}</div>}
                        </td>
                        <td>
                          <input type="number" placeholder="Jumlah" value={item.jumlah} onChange={e => handleItemChange(idx, "jumlah", e.target.value)} />
                          {errors[`jumlah-${idx}`] && <div className="barang-error">{errors[`jumlah-${idx}`]}</div>}
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
                <p>Apakah Anda yakin ingin menyimpan data ini?</p>
              ) : (
                <>
                  <p>Apakah Anda yakin ingin membatalkan formulir?</p>
                  <p className="warning-text">Semua data akan hilang.</p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setModalType(null)}>Kembali</button>
              <button className={modalType === "confirm" ? "primary-btn" : "danger-btn"}
                onClick={modalType === "confirm"
                  ? handleConfirm
                  : () => navigate("/goods-transport")}>
                {modalType === "confirm" ? "Ya, Simpan" : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Pemindahan Disimpan</h3>
              <button className="close-button" onClick={() => setSuccessModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Data berhasil disimpan.</p>
            </div>
            <div className="modal-footer">
              <button className="primary-btn" onClick={() => navigate("/goods-transport")}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGoodsTransport;
