import { useNavigate } from "react-router-dom";
import "../styles/Finance.css";
import expenseImage from "../assets/Expense.png";
import revenueImage from "../assets/Revenue.png";

const Finance = () => {
    const navigate = useNavigate();

    return (
        <div className="finance-container">
            <h2>Finance Feature</h2>
            <div className="finance-grid">
                <div className="finance-box" onClick={() => navigate("/expense")}>
                    <img src={expenseImage} alt="Expense" />
                    <p>Expense</p>
                </div>

                <div className="finance-box" onClick={() => alert("Storage Clicked")}>
                    <img src={revenueImage} alt="Revenue" />
                    <p>Revenue</p>
                </div>

                {/* <div className="asset-box" onClick={() => navigate("/goods-transport")}>
                    <img src={transportImage} alt="Goods Transport" />
                    <p>Goods Transport</p>
                </div> */}
            </div>
        </div>
    );
};

export default Finance;
