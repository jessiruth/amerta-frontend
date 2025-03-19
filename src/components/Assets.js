import { useNavigate } from "react-router-dom";
import "../styles/Assets.css";
import goodsImage from "../assets/Goods & Service.png";
import storageImage from "../assets/Storage.png";
import transportImage from "../assets/Goods Transport.png";

const Assets = () => {
    const navigate = useNavigate();

    return (
        <div className="assets-container">
            <h2>Asset Feature</h2>
            <div className="assets-grid">
                <div className="asset-box" onClick={() => alert("Goods & Service Clicked")}>
                    <img src={goodsImage} alt="Goods & Service" />
                    <p>Goods & Service</p>
                </div>

                <div className="asset-box" onClick={() => alert("Storage Clicked")}>
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
