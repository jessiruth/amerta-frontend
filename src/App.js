import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import GoodsAndServices from "./components/GoodsAndServices"; // Import komponen baru

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/good-and-services" element={<GoodsAndServices />} />
            </Routes>
        </Router>
    );
}

export default App;