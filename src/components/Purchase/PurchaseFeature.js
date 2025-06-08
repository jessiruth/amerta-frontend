import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../../styles/SalesFeature.css";
import purchaseIcon from "../../assets/Purchase.png";
import purchaseOrderIcon from "../../assets/Purchase Order.png";
import purchaseReceiptIcon from "../../assets/Purchase Receipt.png";
import deliveryNoteIcon from "../../assets/Purchase Payment.png";
import invoiceIcon from "../../assets/Purchase Invoice.png";


const PurchaseFeature = () => {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const role = localStorage.getItem("role")?.toLowerCase();

    useEffect(() => {
        if (!token) navigate("/");
    }, [navigate, token]);

    return (
        <div className="sales-feature-container">
            <h1 className="page-title">Purchase</h1>

            {/* Baris pertama */}
            <div className="sales-feature-row">
                {role !== "komisaris" && (
                    <div className="asset-box" onClick={() => navigate("/purchase/completed")}>
                        <img src={purchaseIcon} alt="Purchase" />
                        <p>Purchase</p>
                    </div>
                )}
                <div className="asset-box" onClick={() => navigate("/purchase-order")}>
                    <img src={purchaseOrderIcon} alt="Purchase Order" />
                    <p>Purchase Order</p>
                </div>
                <div className="asset-box" onClick={() => navigate("/purchase-receipt")}>
                    <img src={purchaseReceiptIcon} alt="Purchase Receipt" />
                    <p>Purchase Receipt</p>
                </div>
            </div>

            {/* Baris kedua */}
            <div className="sales-feature-row center-row">
                <div className="asset-box" onClick={() => navigate("/delivery-note")}>
                    <img src={deliveryNoteIcon} alt="Delivery Note" />
                    <p>Delivery Note</p>
                </div>
                <div className="asset-box" onClick={() => navigate("/purchase-invoice")}>
                    <img src={invoiceIcon} alt="Purchase Invoice" />
                    <p>Purchase Invoice</p>
                </div>
            </div>
        </div>
    );
};

export default PurchaseFeature;
