import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import "../../styles/GudangDetail.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaymentPurchaseOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [vendorName, setVendorName] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [totalAmountPayed, setTotalAmountPayed] = useState("");
  const [modalType, setModalType] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inputErrors, setInputErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      try {
        const res = await axiosInstance.get(`/api/purchase-order/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const order = res.data?.data;
        setData(order);

        const vendorRes = await axiosInstance.get(`/api/customer/${order.customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVendorName(vendorRes.data?.data?.name || "Unknown");
      } catch {
        setData(null);
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

  const handlePayment = async () => {
    const token = localStorage.getItem("token");
    try {
      await axiosInstance.put(`/api/purchase-order/payment/${id}`, {
        paymentDate,
        paymentMethod,
        totalAmountPayed: parseAmount(totalAmountPayed),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalType(null);
      setSuccessModal(true);
    } catch (error){
      setModalType(null);
        const message = error.response?.data?.message || "Gagal membayar purchase order.";
        toast.error(message);
    }
  };

  const validateInputs = () => {
    const errors = {};
    const amountRegex = /^\d+(,\d{1,2})?$/;
    const parsed = parseAmount(totalAmountPayed);

    if (new Date(paymentDate) < new Date(data.invoice?.invoiceDate)) {
      errors.paymentDate = "Tanggal pembayaran tidak boleh sebelum tanggal invoice.";
    }

    if (!totalAmountPayed) {
      errors.totalAmountPayed = "Jumlah bayar wajib diisi.";
    } else if (parsed <= 0) {
      errors.totalAmountPayed = "Jumlah bayar harus lebih dari 0.";
    } 
    else if (!amountRegex.test(totalAmountPayed)) {
      errors.totalAmountPayed = "Gunakan format yang sesuai, contoh: 12500,50";
    } else if (parsed > data.invoice?.remainingAmount) {
      errors.totalAmountPayed = "Jumlah bayar tidak boleh lebih dari sisa tagihan.";
    }

    if (!paymentMethod) {
      errors.paymentMethod = "Metode pembayaran harus dipilih.";
    }

    setInputErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Data tidak ditemukan</p>;

  return (
    <div className="gudang-form-container">
      <ToastContainer />
      <div className="gudang-form-content">
        <div className="page-header">
          <h1 className="page-title">Pembayaran Purchase Order</h1>
        </div>

        <div className="detail-card">
          <div className="section-header"><h2 className="section-title">Informasi Utama</h2></div>
          <div className="section-content">
            <div className="detail-row"><span className="detail-label">ID:</span><span className="detail-value">{data.id}</span></div>
            <div className="detail-row"><span className="detail-label">Vendor:</span><span className="detail-value">{vendorName}</span></div>
            <div className="detail-row"><span className="detail-label">Tanggal:</span><span className="detail-value">{formatDate(data.purchaseDate)}</span></div>
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

        {data.status === "CONFIRMED" && (
          <div className="detail-card">
            <div className="section-header"><h2 className="section-title">Input Pembayaran</h2></div>
            <div className="section-content">
              <div className="form-row">
                <div className="form-group">
                  <label>Tanggal Pembayaran</label>
                  <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                  {inputErrors.paymentDate && <span className="error-message">{inputErrors.paymentDate}</span>}
                </div>
                <div className="form-group">
                  <label>Metode Pembayaran</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="">Pilih Metode</option>
                    <option value="CASH">CASH</option>
                    <option value="TRANSFER">TRANSFER</option>
                  </select>
                  {inputErrors.paymentMethod && <span className="error-message">{inputErrors.paymentMethod}</span>}
                </div>
                <div className="form-group">
                  <label>Jumlah Dibayar</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Contoh: 12000,50"
                    value={totalAmountPayed}
                    onChange={(e) => setTotalAmountPayed(e.target.value)}
                  />
                  {inputErrors.totalAmountPayed && <span className="error-message">{inputErrors.totalAmountPayed}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          {data.status === "CONFIRMED" ? (
            <>
              <button className="cancel-btn" onClick={() => setModalType("cancel")}>Batal</button>
              <button className="submit-btn" onClick={() => {
                if (validateInputs()) setModalType("confirm");
              }}>Bayar</button>
            </>
          ) : (
            <button className="cancel-btn" onClick={() => navigate("/purchase-order")}>Kembali</button>
          )}
        </div>

        {modalType && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{modalType === "confirm" ? "Konfirmasi Pembayaran" : "Batalkan Proses"}</h3>
                <button className="close-button" onClick={() => setModalType(null)}>&times;</button>
              </div>
              <div className="modal-body">
                {modalType === "confirm" ? (
                  <p>Apakah Anda yakin ingin melakukan pembayaran?</p>
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
                    if (modalType === "confirm") handlePayment();
                    else navigate(`/purchase/completed/detail/${id}`);
                  }}
                >
                  {modalType === "confirm" ? "Ya, Bayar" : "Ya, Batalkan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {successModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Pembayaran Berhasil</h3>
                <button className="close-button" onClick={() => setSuccessModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <p>Pembayaran telah diterima. Anda akan diarahkan ke detail Purchase Order.</p>
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

export default PaymentPurchaseOrder;
