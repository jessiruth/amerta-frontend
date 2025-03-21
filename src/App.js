import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import GoodsAndServices from "./components/GoodsAndServices";
import GoodsDetail from "./components/GoodsDetail";
import Assets from "./components/Assets";
import GoodsTransport from "./components/GoodsTransport";
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
                <Route path="/goods-transport" element={<GoodsTransport />} />
                <Route path="/good-and-services/:id" element={<GoodsDetail />} />
                <Route path="/company" element={<Company />} />
                <Route path="/employee" element={<Employee />} />
                <Route path="/create-pengeluaran" element={<CreatePengeluaran />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/expense" element={<Expense />} />
                <Route path="/expense/detail/:id" element={<ExpenseDetail />} />
                <Route path="/goods-transport/detail/:id" element={<GoodsTransportDetail />} />
                <Route path="/revenue" element={<Revenue />} />
                <Route path="/revenue/detail/:id" element={<RevenueDetail />} />
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