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
import Company from "./components/Company";
import Employee from "./components/Employee";
import CreatePengeluaran from "./components/Pengeluaran";
import Finance from "./components/Finance";
import Expense from "./components/Expense";
import ExpenseDetail from "./components/ExpenseDetail";
import GoodsTransportDetail from "./components/GoodsTransportDetail";
import Revenue from "./components/Revenue";
import RevenueDetail from "./components/RevenueDetail";
import AddEmployee from "./components/AddEmployee";
import AddGoodsTransport from "./components/AddGoodsTransport";


import AddGudang from "./components/Storage/AddGudang";
import GudangList from './components/Storage/GudangList';
import GudangDetail from "./components/Storage/GudangDetail";
import UpdateGudang from "./components/Storage/UpdateGudang";
import CreatePenerimaan from "./components/Penerimaan";

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
                <Route path="/good-and-services" element={<GoodsAndServices />} />
                <Route path="/goods-transport" element={<GoodsTransport />} />
                <Route path="/good-and-services/:id" element={<GoodsDetail />} />
                <Route path="/company" element={<Company />} />
                <Route path="/employee" element={<Employee />} />
                <Route path="/create-pengeluaran" element={<CreatePengeluaran />} />
                <Route path="/create-penerimaan" element={<CreatePenerimaan />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/expense" element={<Expense />} />
                <Route path="/expense/detail/:id" element={<ExpenseDetail />} />
                <Route path="/goods-transport/detail/:id" element={<GoodsTransportDetail />} />
                <Route path="/revenue" element={<Revenue />} />
                <Route path="/revenue/detail/:id" element={<RevenueDetail />} />
                <Route path="/employee/add" element={<AddEmployee />} />
                <Route path="/goods-transport/add" element={<AddGoodsTransport />} />
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