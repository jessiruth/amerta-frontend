import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <div className="Home-container">
            <nav className="navbar">
                <h2>Home</h2>
                <button onClick={() => navigate("/good-and-services")}>
                    Goods & Services
                </button>
                <button onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    navigate("/");
                }}>Logout</button>
            </nav>
            <div className="content">
                <h3>Selamat Datang di Home</h3>
                <p>Halaman ini masih kosong, nantinya akan ada informasi lebih lanjut.</p>
            </div>
        </div>
    );
};

export default Home;
