import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GudangDetail.css";
import "../../styles/AddSalesOrder.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeliveryPurchaseOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [vendorName, setVendorName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split("T")[0]);
  const [deliveryFee, setDeliveryFee] = useState("");
  const [inputErrors, setInputErrors] = useState({});
  const [modalType, setModalType] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      try {
        const res = await axiosInstance.get(`/api/purchase-order/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const poData = res.data?.data;
        setData(poData);

        const vendorRes = await axiosInstance.get(`/api/customer/${poData.customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVendorName(vendorRes.data?.data?.name || "Unknown");
      } catch {
        console.error("Gagal memuat data PO");
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

  const parseAmount = (val) => parseFloat(val.replace(",", "."));

  const validateInputs = () => {
    const errors = {};
    const amountRegex = /^\d+(,\d{1,2})?$/;
    const parsedFee = parseAmount(deliveryFee);

    if (!deliveryFee) {
      errors.deliveryFee = "Biaya kirim wajib diisi";
    } else if (parsedFee < 0) {
      errors.deliveryFee = "Biaya kirim harus >= 0";
    } else if (!amountRegex.test(deliveryFee)) {
      errors.deliveryFee = "Gunakan format yang sesuai, contoh: 12000,50";
    }

    if (new Date(deliveryDate) < new Date(data.invoice?.invoiceDate)) {
      errors.deliveryDate = "Tanggal pengiriman tidak boleh sebelum tanggal invoice.";
    }

    setInputErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    try {
      await axiosInstance.put(`/api/purchase-order/delivery/${id}`, {
        deliveryDate,
        deliveryFee: parseAmount(deliveryFee),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalType(null);
      setSuccessModal(true);
    } catch (error){
      setModalType(null);
      const message = error.response?.data?.message || "Gagal untuk delivery purchase order.";
      toast.error(message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Data tidak ditemukan.</p>;

  return (
    <div className="gudang-form-container">
      <ToastContainer />
      <div className="gudang-form-content">
        <div className="page-header">
          <h1 className="page-title">Pengiriman Purchase Order</h1>
        </div>

        <div className="detail-card">
          <div className="section-header"><h2 className="section-title">Informasi Utama</h2></div>
          <div className="section-content">
            <div className="detail-row"><span className="detail-label">ID:</span><span className="detail-value">{data.id}</span></div>
            <div className="detail-row"><span className="detail-label">Vendor:</span><span className="detail-value">{vendorName}</span></div>
            <div className="detail-row"><span className="detail-label">Tanggal:</span><span className="detail-value">{formatDate(data.purchaseDate)}</span></div>
            <div className="detail-row"><span className="detail-label">Total Harga:</span><span className="detail-value">Rp{parseFloat(data.totalPrice).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
            <div className="detail-row"><span className="detail-label">Status:</span><span className="detail-value">{data.status}</span></div>
          </div>
        </div>

        {data.invoice && (
          <div className="detail-card">
            <div className="section-header"><h2 className="section-title">Faktur</h2></div>
            <div className="section-content">
              <div className="detail-row"><span className="detail-label">Tanggal Invoice:</span><span className="detail-value">{formatDate(data.invoice.invoiceDate)}</span></div>
              <div className="detail-row"><span className="detail-label">Status Invoice:</span><span className="detail-value">{data.invoice.invoiceStatus}</span></div>
              <div className="detail-row"><span className="detail-label">Total Tagihan:</span><span className="detail-value">Rp{parseFloat(data.invoice.totalAmount).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
              <div className="detail-row"><span className="detail-label">Jatuh Tempo:</span><span className="detail-value">{formatDate(data.invoice.dueDate)}</span></div>
              <div className="detail-row"><span className="detail-label">Sisa Tagihan:</span><span className="detail-value">Rp{parseFloat(data.invoice.remainingAmount).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
            </div>
          </div>
        )}

        {data.payment && (
          <div className="detail-card">
            <div className="section-header"><h2 className="section-title">Pembayaran</h2></div>
            <div className="section-content">
              <div className="detail-row"><span className="detail-label">Tanggal:</span><span className="detail-value">{formatDate(data.payment.paymentDate)}</span></div>
              <div className="detail-row"><span className="detail-label">Metode:</span><span className="detail-value">{data.payment.paymentMethod}</span></div>
              <div className="detail-row"><span className="detail-label">Status:</span><span className="detail-value">{data.payment.paymentStatus}</span></div>
              <div className="detail-row"><span className="detail-label">Jumlah Dibayar:</span><span className="detail-value">Rp{parseFloat(data.payment.totalAmountPayed).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span></div>
            </div>
          </div>
        )}

        <div className="detail-card">
          <div className="section-header"><h2 className="section-title">Input Pengiriman</h2></div>
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Tanggal Pengiriman</label>
                <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                {inputErrors.deliveryDate && <span className="error-message">{inputErrors.deliveryDate}</span>}
              </div>
              <div className="form-group">
                <label>Biaya Kirim</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Contoh: 12000,50"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                />
                {inputErrors.deliveryFee && <span className="error-message">{inputErrors.deliveryFee}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="cancel-btn" onClick={() => setModalType("cancel")}>Batal</button>
          <button className="submit-btn" onClick={() => {
            if (validateInputs()) setModalType("confirm");
          }}>Kirim</button>
        </div>

        {modalType && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{modalType === "confirm" ? "Konfirmasi Pengiriman" : "Batalkan Proses"}</h3>
                <button className="close-button" onClick={() => setModalType(null)}>&times;</button>
              </div>
              <div className="modal-body">
                {modalType === "confirm" ? (
                  <p>Apakah Anda yakin ingin memulai pengiriman?</p>
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
                    if (modalType === "confirm") handleSubmit();
                    else navigate(`/purchase/completed/detail/${id}`);
                  }}
                >
                  {modalType === "confirm" ? "Ya, Kirim" : "Ya, Batalkan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {successModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Pengiriman Dimulai</h3>
                <button className="close-button" onClick={() => setSuccessModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <p>Pengiriman berhasil dimulai. Anda akan diarahkan ke halaman detail purchase order.</p>
              </div>
              <div className="modal-footer">
                <button className="primary-btn" onClick={() => navigate(`/purchase/completed/detail/${id}`)}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPurchaseOrder;
