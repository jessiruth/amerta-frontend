import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/Logo.png";
import logoutIcon from "../assets/Logout.png";
import companyIcon from "../assets/Company.png";
import financeIcon from "../assets/Finance.png";
import purchasesIcon from "../assets/Purchases.png";
import salesIcon from "../assets/Sales.png";
import assetsIcon from "../assets/Assets.png";
import crmIcon from "../assets/CRM.png";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    };

    return (
        <div className="navbar-container">
            {/* Navbar Atas */}
            <div className="navbar-top">
                <img src={logo} alt="Logo" className="logo" />
                <button onClick={handleLogout} className="logout-btn">
                    <img src={logoutIcon} alt="Logout" />
                </button>
            </div>

            {/* Navbar Kiri */}
            <div className="navbar-left">
                <img src={companyIcon} alt="Company" className="nav-icon" />
                <img src={financeIcon} alt="Finance" className="nav-icon" />
                <img src={purchasesIcon} alt="Purchases" className="nav-icon" />
                <img src={salesIcon} alt="Sales" className="nav-icon" />
                <img src={assetsIcon} alt="Assets" className="nav-icon" />
                <img src={crmIcon} alt="CRM" className="nav-icon" />
            </div>
        </div>
    );
};

export default Navbar;