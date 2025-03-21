import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toolbar from "../components/Toolbar";
import "../styles/Employee.css";

const Employee = () => {
    const [employees, setEmployees] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/");
        }
    }, [navigate, token]);

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/user/all?role=", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("API Response:", response.data);

            if (response.data && Array.isArray(response.data.data)) {
                setEmployees(response.data.data);
            } else {
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    }, [token]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    return (
        <div className="employee-container">
            <h1 className="page-title">Employee</h1>

            <Toolbar
                onAdd={() => navigate("/employee/add")}
                onRefresh={fetchEmployees}
                onFilter={() => console.log("Filter Clicked")}
                onSearch={(term) => console.log("Search:", term)}
            />

            <table className="employee-table">
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Handphone</th>
                        <th>Whatsapp Number</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.length > 0 ? (
                        employees.map((employee) => (
                            <tr key={employee.id}>
                                <td>{employee.name}</td>
                                <td>{employee.role}</td>
                                <td>{employee.email}</td>
                                <td>{employee.phone}</td>
                                <td>{employee.whatsappNumber}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Employee;
