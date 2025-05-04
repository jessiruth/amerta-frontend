import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../styles/Assets.css";
import goodsImage from "../assets/Goods & Service.png";
import storageImage from "../assets/Storage.png";
import transportImage from "../assets/Goods Transport.png";

const Assets = () => {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) navigate("/");
    }, [navigate, token]);

    return (
        <div className="assets-container">
            <h1 className="page-title">Assets</h1>
            <div className="assets-grid">
                <div className="asset-box" onClick={() => navigate("/goods-and-services")}>
                    <img src={goodsImage} alt="Goods & Services" />
                    <p>Goods & Service</p>
                </div>

                <div className="asset-box" onClick={() => navigate("/gudang")}>
                    <img src={storageImage} alt="Storage" />
                    <p>Storage</p>
                </div>

                <div className="asset-box" onClick={() => navigate("/goods-transport")}>
                    <img src={transportImage} alt="Goods Transport" />
                    <p>Goods Transport</p>
                </div>
            </div>
        </div>
    );
};

export default Assets;
