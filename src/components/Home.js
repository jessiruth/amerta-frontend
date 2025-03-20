import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
        }

        const storedName = localStorage.getItem("name");
        if (storedName) {
            setName(storedName);
        }
    }, [navigate]);

    return (
        <div className="Home-container">
            <nav className="navbar">
                <h2>Home</h2>
                <button onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("name");
                    navigate("/");
                }}>Logout</button>
            </nav>
            <div className="content">
                <h3>Welcome, {name}!</h3>
                <p>On Development</p>
            </div>
        </div>
    );
};

export default Home;
