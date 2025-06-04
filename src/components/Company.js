import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../styles/Company.css";
import employeeImage from "../assets/Employee.png";
import dashboardImage from "../assets/Dashboard.png";

const Company = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toLowerCase();

  useEffect(() => {
    if (!token) navigate("/");
  }, [navigate, token]);

  return (
    <div className="company-container">
      <h1 className="page-title">Company</h1>
      <div className="company-grid">
        {role !== "sales" && (
          <div className="company-box" onClick={() => navigate("/employee")}>
            <img src={employeeImage} alt="Employee" />
            <p>Employee</p>
          </div>
        )}
        <div className="company-box" onClick={() => navigate("/dashboard")}>
          <img src={dashboardImage} alt="Dashboard" />
          <p>Dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default Company;