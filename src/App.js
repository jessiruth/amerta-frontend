import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import GoodsAndServices from "./components/GoodsAndServices";
import GoodsDetail from "./components/GoodsDetail";
import Assets from "./components/Assets";
// import GoodsTransport from "./components/GoodsTransport";
import Navbar from "./components/Navbar";

import AddGudang from "./components/Storage/AddGudang";
import GudangList from './components/Storage/GudangList';
import GudangDetail from "./components/Storage/GudangDetail";
import UpdateGudang from "./components/Storage/UpdateGudang";

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
                <Route path="/good-and-services" element={<GoodsAndServices />} />
                {/* <Route path="/goods-transport" element={<GoodsTransport />} /> */}
                <Route path="/good-and-services/:id" element={<GoodsDetail />} />
                <Route path="/gudang/add" element={<AddGudang />} />
                <Route path="/gudang" element={<GudangList />} />
                <Route path="/gudang/:namaGudang" element={<GudangDetail />} />
                <Route path="/gudang/update/:namaGudang" element={<UpdateGudang />} />
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