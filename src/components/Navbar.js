import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/Logo.png";
import logoutIcon from "../assets/Logout.png";
import profileIcon from "../assets/Profile.png";
import companyIcon from "../assets/Company.png";
import financeIcon from "../assets/Finance.png";
import purchasesIcon from "../assets/Purchases.png";
import salesIcon from "../assets/Sales.png";
import assetsIcon from "../assets/Assets.png";
import crmIcon from "../assets/CRM.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const AUTO_LOGOUT_TIME = 10 * 60 * 1000;

const Navbar = () => {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [role, setRole] = useState("");

    const handleLogout = useCallback(() => {
        toast.success("Logout berhasil!", { autoClose: 2000 });
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("role");
        localStorage.removeItem("id");

        setTimeout(() => {
            navigate("/");
        }, 2000);
    }, [navigate]);

  useEffect(() => {
    let timeout;

    const storedId = localStorage.getItem("id");
    const storedRole = localStorage.getItem("role");

    if (storedId) setId(storedId);
    if (storedRole) setRole(storedRole.toLowerCase());

        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                toast.info("Anda telah logout karena tidak ada aktivitas.", { autoClose: 3000 });
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
                <div className="top-right-buttons">
                    <button onClick={() => navigate(`/profile/${id}`)} className="logout-btn">
                        <img src={profileIcon} alt="Profile" />
                    </button>
                    <button onClick={() => setShowLogoutModal(true)} className="logout-btn">
                        <img src={logoutIcon} alt="Logout" />
                    </button>
                </div>
            </div>

      {/* Navbar Left */}
      <div className="navbar-left">
        {role !== "kepala_gudang" && (
            <>
            <div className="nav-item" data-tooltip="Company" onClick={() => navigate("/company")}>
                <img src={companyIcon} alt="Company" className="nav-icon" />
            </div>

            {!(["general_manager", "kepala_gudang", "sales"].includes(role)) && (
                <div className="nav-item" data-tooltip="Finance" onClick={() => navigate("/finance")}>
                <img src={financeIcon} alt="Finance" className="nav-icon" />
                </div>
            )}

            <div className="nav-item" data-tooltip="Purchases" onClick={() => navigate("/purchases")}>
                <img src={purchasesIcon} alt="Purchases" className="nav-icon" />
            </div>
            <div className="nav-item" data-tooltip="Sales" onClick={() => navigate("/sales")}>
                <img src={salesIcon} alt="Sales" className="nav-icon" />
            </div>
            </>
        )}

        {role !== "sales" && (
            <div className="nav-item" data-tooltip="Assets" onClick={() => navigate("/assets")}>
                <img src={assetsIcon} alt="Assets" className="nav-icon" />
            </div>
        )}

        {role !== "kepala_gudang" && (
        <div className="nav-item" data-tooltip="CRM" onClick={() => navigate("/customer")}>
                <img src={crmIcon} alt="CRM" className="nav-icon" />
        </div>
        )}
        
      </div>
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Konfirmasi Logout</h3>
                            <button className="close-button" onClick={() => setShowLogoutModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>Apakah Anda yakin ingin logout?</p>
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-btn" onClick={() => setShowLogoutModal(false)}>Batal</button>
                            <button className="danger-btn" onClick={() => {
                                setShowLogoutModal(false);
                                handleLogout();
                            }}>
                                Ya, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
    </div>
  );
};

export default Navbar;