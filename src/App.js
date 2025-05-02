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
import SalesFeature from "./components/Sales/SalesFeature";
import Customer from "./components/Customer";
import AddCustomer from "./components/AddCustomer";
import SalesOrder from "./components/Sales/SalesOrder";
import AddGudang from "./components/Storage/AddGudang";
import GudangList from './components/Storage/GudangList';
import GudangDetail from "./components/Storage/GudangDetail";
import UpdateGudang from "./components/Storage/UpdateGudang";
import CreatePenerimaan from "./components/Penerimaan";
import PurchaseFeature from "./components/Purchase/PurchaseFeature";
import DetailSalesOrder from "./components/Sales/DetailSalesOrder";
import AddSalesOrder from "./components/Sales/AddSalesOrder";
import ConfirmSalesOrder from "./components/Sales/ConfirmSalesOrder";
import PurchaseOrder from "./components/Purchase/PurchaseOrder";
import DetailPurchaseOrder from "./components/Purchase/DetailPurchaseOrder";
import ShippingSalesOrder from "./components/Sales/ShipSalesOrder";
import ConfirmPurchaseOrder from "./components/Purchase/ConfirmPurchaseOrder";
import DeliveryPurchaseOrder from "./components/Purchase/DeliveryPurchaseOrder";
import ConfirmShippingSalesOrder from "./components/Sales/ConfirmShippingSalesOrder";
<<<<<<< HEAD
import SalesReceipt from "./components/SalesReceipt";
import SalesReceiptDetail from "./components/SalesReceiptDetail";
import PurchaseReceipt from "./components/PurchaseReceipt";
import PurchaseReceiptDetail from "./components/PurchaseReceiptDetail";
=======
import PaymentSalesOrder from "./components/Sales/PaymentSalesOrder";
import PaymentPurchaseOrder from "./components/Purchase/PaymentPurchaseOrder";
import CompletePurchaseOrder from "./components/Purchase/CompletePurchaseOrder";
import AddPurchaseOrder from "./components/Purchase/AddPurchaseOrder";
import ShippingList from "./components/Sales/ShippingList";
import DetailShipping from "./components/Sales/ShippingDetail";
<<<<<<< HEAD
>>>>>>> e29e4293b079740868827090f640cf4429db7dfc
=======
import PurchaseInvoice from "./components/PurchaseInvoice";
import PurchaseInvoiceDetail from "./components/PurchaseInvoiceDetail";
import SalesInvoice from "./components/SalesInvoice";
import SalesInvoiceDetail from "./components/SalesInvoiceDetail";
>>>>>>> 8972773338afa551cf344910fa7e144c0e66ba01

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
                <Route path="/sales" element={<SalesFeature />} />\
                <Route path="/purchases" element={<PurchaseFeature />} />
                <Route path="/customer" element={<Customer />} />
                <Route path="/customer/add" element={<AddCustomer />} />
                <Route path="/sales-order" element={<SalesOrder/>} />
                <Route path="/sales-order/detail/:id" element={<DetailSalesOrder />} />
                <Route path="/sales-order/add" element={<AddSalesOrder />} />
                <Route path="/sales-order/confirm/:id" element={<ConfirmSalesOrder />} />
                <Route path="/sales-order/shipping/:id" element={<ShippingSalesOrder />} />
                <Route path="/purchase-order" element={<PurchaseOrder/>} />
                <Route path="/purchase-order/detail/:id" element={<DetailPurchaseOrder />} />
                <Route path="/purchase-order/confirm/:id" element={<ConfirmPurchaseOrder />} /> 
                <Route path="/purchase-order/payment/:id" element={<PaymentPurchaseOrder />} />
                <Route path="/purchase-order/delivery/:id" element={<DeliveryPurchaseOrder />} />
                <Route path="/purchase-order/complete/:id" element={<CompletePurchaseOrder />} />
                <Route path="/purchase-order/add" element={<AddPurchaseOrder />} />
                <Route path="/sales-order/confirm-shipping/:id" element={<ConfirmShippingSalesOrder />} />
<<<<<<< HEAD
                <Route path="/sales-receipt" element={<SalesReceipt/>} />
                <Route path="/sales-receipt/detail/:id" element={<SalesReceiptDetail />} />
                <Route path="/purchase-receipt" element={<PurchaseReceipt/>} />
                <Route path="/purhcase-receipt/detail/:id" element={<PurchaseReceiptDetail />} />
=======
                <Route path="/sales-order/payment/:id" element={<PaymentSalesOrder />} />
                <Route path="/shipping" element={<ShippingList />} />
                <Route path="/shipping/detail/:id" element={<DetailShipping />} />
<<<<<<< HEAD
>>>>>>> e29e4293b079740868827090f640cf4429db7dfc

=======
                <Route path="/purchase-invoice" element={<PurchaseInvoice />} />
                <Route path="/purchase-invoice/detail/:id" element={<PurchaseInvoiceDetail />} />
                <Route path="/sales-invoice" element={<SalesInvoice />} />
                <Route path="/sales-invoice/detail/:id" element={<SalesInvoiceDetail />} />
>>>>>>> 8972773338afa551cf344910fa7e144c0e66ba01
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