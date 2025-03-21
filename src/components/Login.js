import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import logo from "../assets/Logo.png";
import axiosInstance from '../services/axiosInstance';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
    
        try {
            console.log("Mengirim permintaan login...");
            const response = await axiosInstance.post("/api/auth/login", {
                email,
                password
            });
    
            console.log("Response dari server:", response);
    
            if (response.data.status === 200) {
                console.log("Login berhasil, menyimpan token...");
                localStorage.setItem("token", response.data.data.token);
                localStorage.setItem("role", response.data.data.role);
                navigate("/home");
            } else {
                console.log("Login gagal, status bukan 200:", response.data);
                setError("Login gagal! Periksa kembali email dan password.");
            }
        } catch (err) {
            console.log("Terjadi kesalahan:", err);
    
            if (err.response) {
                console.log("Response error:", err.response);
                setError(err.response.data.message || "Terjadi kesalahan saat login.");
            } else if (err.request) {
                console.log("Request error:", err.request);
                setError("Tidak ada respons dari server. Periksa koneksi Anda.");
            } else {
                console.log("Error lainnya:", err.message);
                setError("Terjadi kesalahan yang tidak diketahui.");
            }
        }
    };

    return (
        <div className="login-container">
            <header className="login-header">
                <img src={logo} alt="Logo" className="logo" />
            </header>
            <div className="login-box">
                <h2>Login</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Enter text here"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Enter text here"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;