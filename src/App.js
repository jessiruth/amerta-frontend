import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import GoodsAndServices from "./components/GoodsAndServices/GoodsAndServices";
import GoodsDetail from "./components/GoodsAndServices/GoodsDetail";
import Assets from "./components/Assets";
import GoodsTransport from "./components/GoodsTransport";
import AddGoods from "./components/GoodsAndServices/AddGoodsAndServices";
import UpdateGoods from "./components/GoodsAndServices/UpdateGoods";
import Navbar from "./components/Navbar";

function Layout() {
    const location = useLocation();
    const hideNavbarOnLogin = location.pathname === "/";

    return (
        <div>
            {!hideNavbarOnLogin && <Navbar />}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/goods-and-services" element={<GoodsAndServices />} />
                <Route path="/goods-transport" element={<GoodsTransport />} />
                <Route path="/goods-and-services/:id" element={<GoodsDetail />} />
                <Route path="/goods-and-services/add" element={<AddGoods />} />
                <Route path="/goods-and-services/update/:id" element={<UpdateGoods />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Layout />
        </Router>
    );
}

export default App;