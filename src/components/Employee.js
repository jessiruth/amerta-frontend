import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/ToolbarEmployee";
import "../styles/GoodsTransport.css";
import axiosInstance from "../services/axiosInstance";

const Employee = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchCategory, setSearchCategory] = useState("all");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/");
        }
    }, [navigate, token]);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/api/user/all?role=", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data && Array.isArray(response.data.data)) {
                setEmployees(response.data.data);
                setFilteredEmployees(response.data.data);
            } else {
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase().trim();

        const filtered = employees.filter((emp) => {
            if (!lower) return true;

            switch (searchCategory) {
                case "nama":
                    return emp.name.toLowerCase() === lower;
                case "email":
                    return emp.email.toLowerCase() === lower;
                case "role":
                    return emp.role.toLowerCase() === lower;
                case "no_hp":
                    return emp.phone?.toLowerCase() === lower;
                case "wa":
                    return emp.whatsappNumber?.toLowerCase() === lower;
                case "all":
                default:
                    return (
                        emp.name.toLowerCase().includes(lower) ||
                        emp.email.toLowerCase().includes(lower) ||
                        emp.role.toLowerCase().includes(lower) ||
                        emp.phone?.toLowerCase().includes(lower) ||
                        emp.whatsappNumber?.toLowerCase().includes(lower)
                    );
            }
        });

        setFilteredEmployees(filtered);
    }, [searchTerm, searchCategory, employees]);

    const handleRefresh = () => {
        setSearchTerm("");
        setSearchCategory("all");
        fetchEmployees();
    };

    return (
        <div className="employee-container">
            <h1 className="page-title">Employee</h1>

            <Toolbar
                onAdd={() => navigate("/employee/add")}
                onRefresh={handleRefresh}
                onFilter={(category) => setSearchCategory(category)}
                onSearch={(term) => setSearchTerm(term)}
                selectedCategory={searchCategory}
                searchTerm={searchTerm}
            />

            <div className="table-container">
                <div className="table-header">
                    <h2>Employee List</h2>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <p>Loading...</p>
                    </div>
                ) : (
                    <table className="gudang-table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Role</th>
                                <th>Email</th>
                                <th>Handphone</th>
                                <th>Whatsapp Number</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td>{employee.name}</td>
                                        <td>{employee.role}</td>
                                        <td>{employee.email}</td>
                                        <td>{employee.phone}</td>
                                        <td>{employee.whatsappNumber}</td>
                                        <td>
                                            <button
                                                className="detail-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/employee/${employee.id}`);
                                                }}
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Employee;