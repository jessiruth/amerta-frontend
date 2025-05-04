import { useNavigate } from "react-router-dom";
import "../styles/Finance.css";
import expenseImage from "../assets/Expense.png";
import revenueImage from "../assets/Revenue.png";

const Finance = () => {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) navigate("/");
    }, [navigate, token]);

    return (
        <div className="finance-container">
            <h1 className="page-title">Finance</h1>
            <div className="finance-grid">
                <div className="finance-box" onClick={() => navigate("/expense")}>
                    <img src={expenseImage} alt="Expense" />
                    <p>Expense</p>
                </div>

                <div className="finance-box" onClick={() => navigate("/revenue")}>
                    <img src={revenueImage} alt="Revenue" />
                    <p>Revenue</p>
                </div>
            </div>
        </div>
    );
};

export default Finance;
