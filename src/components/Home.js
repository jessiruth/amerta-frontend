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
                <button onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    navigate("/");
                }}>Logout</button>
            </nav>
            <div className="content">
                <h3>Dashboard</h3>
                <p>On Development</p>
            </div>
        </div>
    );
};

export default Home;
