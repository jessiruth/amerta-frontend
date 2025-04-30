import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import "../styles/Employee.css";
import axiosInstance from "../services/axiosInstance";

const Customer = () => {
    const [customer, setCustomer] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/");
        }
    }, [navigate, token]);

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/api/customer/viewall?role=", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("API Response:", response.data);

            if (response.data && Array.isArray(response.data.data)) {
                setCustomer(response.data.data);
            } else {
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    }, [token]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    return (
        <div className="employee-container">
            <h1 className="page-title">Customer</h1>

            <Toolbar
                onAdd={() => navigate("/customer/add")}
                onRefresh={fetchCustomers}
                onFilter={() => console.log("Filter Clicked")}
                onSearch={(term) => console.log("Search:", term)}
            />

            <table className="employee-table"> {/* harusnya employee-table big man */}
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
                    {customer.length > 0 ? (
                        customer.map((customer) => (
                            <tr key={customer.id}>
                                <td>{customer.name}</td>
                                <td>{customer.role}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone}</td>
                                <td>{customer.whatsapp}</td>
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

export default Customer;
