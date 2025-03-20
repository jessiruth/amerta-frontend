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
            {/* Navbar Top */}
            <div className="navbar-top">
                <img
                    src={logo}
                    alt="Logo"
                    className="logo clickable-logo"
                    onClick={() => navigate("/home")}
                />
                <button onClick={handleLogout} className="logout-btn">
                    <img src={logoutIcon} alt="Logout" />
                </button>
            </div>

            {/* Navbar Left */}
            <div className="navbar-left">
                <div className="nav-item" data-tooltip="Company">
                    <img src={companyIcon} alt="Company" className="nav-icon" />
                </div>
                <div className="nav-item" data-tooltip="Finance" onClick={() => navigate("/finance")}>
                    <img src={financeIcon} alt="Finance" className="nav-icon" />
                </div>
                <div className="nav-item" data-tooltip="Purchases">
                    <img src={purchasesIcon} alt="Purchases" className="nav-icon" />
                </div>
                <div className="nav-item" data-tooltip="Sales">
                    <img src={salesIcon} alt="Sales" className="nav-icon" />
                </div>
                <div className="nav-item" data-tooltip="Assets" onClick={() => navigate("/assets")}>
                    <img src={assetsIcon} alt="Assets" className="nav-icon" />
                </div>
                <div className="nav-item" data-tooltip="CRM">
                    <img src={crmIcon} alt="CRM" className="nav-icon" />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
