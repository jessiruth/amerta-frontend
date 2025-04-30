import { useNavigate } from "react-router-dom";
import "../styles/Company.css";
import employeeImage from "../assets/Employee.png";

const Company = () => {
    const navigate = useNavigate();

    return (
        <div className="company-container">
            <h1 className="page-title">Company</h1>
            <div className="company-grid">
                <div className="company-box" onClick={() => navigate("/employee")}>
                    <img src={employeeImage} alt="Employee" />
                    <p>Employee</p>
                </div>
                <div className="company-box" onClick={() => navigate("/customer")}>
                    <img src={employeeImage} alt="Customer" />
                    <p>Customer</p>
                </div>
            </div>
        </div>
    );
};

export default Company;