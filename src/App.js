import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import Assets from "./components/Assets";
import GoodsTransport from "./components/GoodsTransport";
import Navbar from "./components/Navbar";
import CreatePengeluaran from "./components/Pengeluaran";
import Finance from "./components/Finance";
import Expense from "./components/Expense";
import ExpenseDetail from "./components/ExpenseDetail";
import GoodsTransportDetail from "./components/GoodsTransportDetail";

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
                <Route path="/goods-transport" element={<GoodsTransport />} />
                <Route path="/create-pengeluaran" element={<CreatePengeluaran />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/expense" element={<Expense />} />
                <Route path="/expense/detail/:id" element={<ExpenseDetail />} />
                <Route path="/goods-transport/detail/:id" element={<GoodsTransportDetail />} />
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
