import { useEffect, useCallback } from "react";
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

const AUTO_LOGOUT_TIME = 10 * 60 * 1000;

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            localStorage.removeItem("token");
            localStorage.removeItem("name");
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        let timeout;

        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                alert("You have been logged out due to inactivity.");
                handleLogout();
            }, AUTO_LOGOUT_TIME);
        };

        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keypress", resetTimer);
        window.addEventListener("click", resetTimer);
        window.addEventListener("scroll", resetTimer);

        resetTimer();

        return () => {
            clearTimeout(timeout);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keypress", resetTimer);
            window.removeEventListener("click", resetTimer);
            window.removeEventListener("scroll", resetTimer);
        };
    }, [handleLogout]);

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
                <div className="nav-item" data-tooltip="Company" onClick={() => navigate("/company")}>
                    <img src={companyIcon} alt="Company" className="nav-icon" />
                </div>
                <div className="nav-item" data-tooltip="Finance" onClick={() => navigate("/finance")}>
                    <img src={financeIcon} alt="Finance" className="nav-icon" />
                </div>
                <div className="nav-item" data-tooltip="Purchases" onClick={() => navigate("/purchases")}>
                    <img src={purchasesIcon} alt="Purchases" className="nav-icon" />
                </div>
                <div className="nav-item" data-tooltip="Sales" onClick={() => navigate("/sales")}>
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
