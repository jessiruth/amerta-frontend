import { useNavigate } from "react-router-dom";
import "../../styles/SalesFeature.css";
import salesIcon from "../../assets/Sales2.png";
import salesOrderIcon from "../../assets/Sales Order.png";
import shippingIcon from "../../assets/Shipping.png";
import receiptIcon from "../../assets/Sales Receipt.png";
import invoiceIcon from "../../assets/Sales Invoice.png";

const SalesFeature = () => {
    const navigate = useNavigate();

    return (
        <div className="sales-feature-container">
            <h1 className="page-title">Sales</h1>

            {/* Baris pertama */}
            <div className="sales-feature-row">
                <div className="asset-box" onClick={() => navigate("/sales/completed")}>
                    <img src={salesIcon} alt="Sales" />
                    <p>Sales</p>
                </div>
                <div className="asset-box" onClick={() => navigate("/sales-order")}>
                    <img src={salesOrderIcon} alt="Sales Order" />
                    <p>Sales Order</p>
                </div>
                <div className="asset-box" onClick={() => navigate("/shipping")}>
                    <img src={shippingIcon} alt="Shipping" />
                    <p>Shipping</p>
                </div>
            </div>

            {/* Baris kedua */}
            <div className="sales-feature-row center-row">
                <div className="asset-box" onClick={() => navigate("/sales-receipt")}>
                    <img src={receiptIcon} alt="Sales Receipt" />
                    <p>Sales Receipt</p>
                </div>
                <div className="asset-box" onClick={() => navigate("/sales-invoice")}>
                    <img src={invoiceIcon} alt="Sales Invoice" />
                    <p>Sales Invoice</p>
                </div>
            </div>
        </div>
    );
};

export default SalesFeature;
