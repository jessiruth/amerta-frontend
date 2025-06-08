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
import EmployeeDetail from "./components/EmployeeDetail";
import CreatePengeluaran from "./components/Pengeluaran";
import Finance from "./components/Finance";
import Expense from "./components/Expense";
import ExpenseDetail from "./components/ExpenseDetail";
import GoodsTransportDetail from "./components/GoodsTransportDetail";
import Revenue from "./components/Revenue";
import RevenueDetail from "./components/RevenueDetail";
import AddEmployee from "./components/AddEmployee";
import UpdateEmployee from "./components/UpdateEmployee";
import AddGoodsTransport from "./components/AddGoodsTransport";
import SalesFeature from "./components/Sales/SalesFeature";
import Customer from "./components/Customer";
import AddCustomer from "./components/AddCustomer";
import UpdateCustomer from "./components/UpdateCustomer";
import CustomerDetail from "./components/CustomerDetail";
import Sales from "./components/Sales/Sales";
import SalesOrder from "./components/Sales/SalesOrder";
import AddGudang from "./components/Storage/AddGudang";
import GudangList from './components/Storage/GudangList';
import GudangDetail from "./components/Storage/GudangDetail";
import UpdateGudang from "./components/Storage/UpdateGudang";
import CreatePenerimaan from "./components/Penerimaan";
import PurchaseFeature from "./components/Purchase/PurchaseFeature";
import Purchase from "./components/Purchase/Purchase";
import PurchaseOrder from "./components/Purchase/PurchaseOrder";
import DetailSalesOrder from "./components/Sales/DetailSalesOrder";
import AddSalesOrder from "./components/Sales/AddSalesOrder";
import ConfirmSalesOrder from "./components/Sales/ConfirmSalesOrder";
import DetailPurchaseOrder from "./components/Purchase/DetailPurchaseOrder";
import ShippingSalesOrder from "./components/Sales/ShipSalesOrder";
import ConfirmPurchaseOrder from "./components/Purchase/ConfirmPurchaseOrder";
import DeliveryPurchaseOrder from "./components/Purchase/DeliveryPurchaseOrder";
import ConfirmShippingSalesOrder from "./components/Sales/ConfirmShippingSalesOrder";
import SalesReceipt from "./components/SalesReceipt";
import SalesReceiptDetail from "./components/SalesReceiptDetail";
import PurchaseReceipt from "./components/PurchaseReceipt";
import PurchaseReceiptDetail from "./components/PurchaseReceiptDetail";
import PaymentSalesOrder from "./components/Sales/PaymentSalesOrder";
import PaymentPurchaseOrder from "./components/Purchase/PaymentPurchaseOrder";
import CompletePurchaseOrder from "./components/Purchase/CompletePurchaseOrder";
import AddPurchaseOrder from "./components/Purchase/AddPurchaseOrder";
import ShippingList from "./components/Sales/ShippingList";
import DetailShipping from "./components/Sales/ShippingDetail";
import DeliveryList from "./components/Purchase/DeliveryList";
import DetailDelivery from "./components/Purchase/DeliveryDetail";
import PurchaseInvoice from "./components/PurchaseInvoice";
import PurchaseInvoiceDetail from "./components/PurchaseInvoiceDetail";
import SalesInvoice from "./components/SalesInvoice";
import SalesInvoiceDetail from "./components/SalesInvoiceDetail";
import DetailPurchase from "./components/Purchase/DetailPurchase";
import DetailSales from "./components/Sales/DetailSales";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import UpdateProfile from "./components/UpdateProfile";
import UpdatePassword from "./components/UpdatePassword";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

function Layout() {
    const location = useLocation();
    const hideNavbarOnLogin = location.pathname === "/";

    return (
        <div>
            {!hideNavbarOnLogin && <Navbar />}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />

                <Route path="/assets" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "kepala_gudang", "administrasi", "komisaris"]}>
                        <Assets />
                    </RoleProtectedRoute>
                } />
                <Route path="/goods-and-services" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "kepala_gudang", "administrasi", "komisaris"]}>
                        <GoodsAndServices />
                    </RoleProtectedRoute>
                } />
                <Route path="/goods-and-services/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "kepala_gudang", "administrasi", "komisaris"]}>
                        <GoodsDetail />
                    </RoleProtectedRoute>
                } />
                <Route path="/goods-and-services/add" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager"]}>
                        <AddGoods />
                    </RoleProtectedRoute>
                } />
                <Route path="/goods-and-services/update/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "kepala_gudang"]}>
                        <UpdateGoods />
                    </RoleProtectedRoute>
                } />

                <Route path="/goods-transport" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "kepala_gudang", "administrasi", "komisaris"]}>
                        <GoodsTransport />
                    </RoleProtectedRoute>
                } />
                <Route path="/goods-transport/add" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "kepala_gudang"]}>
                        <AddGoodsTransport />
                    </RoleProtectedRoute>
                } />
                <Route path="/goods-transport/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "kepala_gudang", "administrasi", "komisaris"]}>
                        <GoodsTransportDetail />
                    </RoleProtectedRoute>
                } />

                <Route path="/gudang/add" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager"]}>
                        <AddGudang />
                    </RoleProtectedRoute>
                } />
                <Route path="/gudang" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "kepala_gudang", "administrasi", "komisaris"]}>
                        <GudangList />
                    </RoleProtectedRoute>
                } />
                <Route path="/gudang/:namaGudang" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "kepala_gudang", "administrasi", "komisaris"]}>
                        <GudangDetail />
                    </RoleProtectedRoute>
                } />
                <Route path="/gudang/update/:namaGudang" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "kepala_gudang"]}>    
                        <UpdateGudang />
                    </RoleProtectedRoute>
                } />

                <Route path="/company" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <Company />
                    </RoleProtectedRoute>
                } />
                <Route path="/employee" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "administrasi", "komisaris"]}>
                        <Employee />
                    </RoleProtectedRoute>
                } />
                <Route path="/employee/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "administrasi", "komisaris"]}>
                        <EmployeeDetail />
                    </RoleProtectedRoute>
                } />
                <Route path="/employee/add" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "administrasi"]}>
                        <AddEmployee />
                    </RoleProtectedRoute>
                } />
                <Route path="/employee/update/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager"]}>
                        <UpdateEmployee />
                    </RoleProtectedRoute>
                } />
                <Route path="/employee/update-password/:id" element={
                    <RoleProtectedRoute allowedRoles={["administrasi"]}>
                        <UpdatePassword />
                    </RoleProtectedRoute>
                } />

                <Route path="/dashboard" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <Dashboard />
                    </RoleProtectedRoute>
                } />

                <Route path="/finance" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "administrasi", "komisaris"]}>
                        <Finance />
                    </RoleProtectedRoute>
                } />
                <Route path="/create-pengeluaran" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "administrasi"]}>
                        <CreatePengeluaran />
                    </RoleProtectedRoute>
                } />
                <Route path="/expense" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "administrasi", "komisaris"]}>
                        <Expense />
                    </RoleProtectedRoute>
                } />
                <Route path="/expense/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "administrasi", "komisaris"]}>
                        <ExpenseDetail />
                    </RoleProtectedRoute>
                } />

                <Route path="/create-penerimaan" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "administrasi"]}>
                        <CreatePenerimaan />
                    </RoleProtectedRoute>
                } />
                <Route path="/revenue" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "administrasi", "komisaris"]}>
                        <Revenue />
                    </RoleProtectedRoute>
                } />
                <Route path="/revenue/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "administrasi", "komisaris"]}>
                        <RevenueDetail />
                    </RoleProtectedRoute>
                } />

                <Route path="/customer" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <Customer />
                    </RoleProtectedRoute>
                } />
                <Route path="/customer/add" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <AddCustomer />
                    </RoleProtectedRoute>
                } />
                <Route path="/customer/update/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <UpdateCustomer />
                    </RoleProtectedRoute>
                } />
                <Route path="/customer/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <CustomerDetail />
                    </RoleProtectedRoute>
                } />

                <Route path="/sales" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <SalesFeature />
                    </RoleProtectedRoute>
                } />
                <Route path="/sales/completed" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <Sales/>
                    </RoleProtectedRoute>
                } />
                <Route path="/sales/completed/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <DetailSales/>
                    </RoleProtectedRoute>
                } />
                <Route path="/sales-order" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <SalesOrder/>
                    </RoleProtectedRoute>
                } />
                <Route path="/sales-order/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <DetailSalesOrder />
                    </RoleProtectedRoute>
                } />
                <Route path="/sales-order/add" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <AddSalesOrder />
                    </RoleProtectedRoute>
                } />
                <Route path="/sales-order/confirm/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <ConfirmSalesOrder />
                    </RoleProtectedRoute>
                } />
                <Route path="/sales-order/shipping/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <ShippingSalesOrder />
                    </RoleProtectedRoute>
                } />
                <Route path="/sales-order/confirm-shipping/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <ConfirmShippingSalesOrder />
                    </RoleProtectedRoute>
                } />
                <Route path="/sales-order/payment/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <PaymentSalesOrder />
                    </RoleProtectedRoute>
                } />

                <Route path="/purchases" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <PurchaseFeature />
                    </RoleProtectedRoute>
                } />
                <Route path="/purchase/completed" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <Purchase/>
                    </RoleProtectedRoute>
                } />
                <Route path="/purchase/completed/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <DetailPurchase/>
                    </RoleProtectedRoute>
                } />
                <Route path="/purchase-order" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <PurchaseOrder/>
                    </RoleProtectedRoute>
                } />
                <Route path="/purchase-order/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <DetailPurchaseOrder/>
                    </RoleProtectedRoute>
                } />
                <Route path="/purchase-order/add" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <AddPurchaseOrder />
                    </RoleProtectedRoute>
                } />
                <Route path="/purchase-order/confirm/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <ConfirmPurchaseOrder />
                    </RoleProtectedRoute>
                } /> 
                <Route path="/purchase-order/delivery/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <DeliveryPurchaseOrder />
                    </RoleProtectedRoute>
                } />
                <Route path="/purchase-order/complete-delivery/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <CompletePurchaseOrder />
                    </RoleProtectedRoute>
                } />
                <Route path="/purchase-order/payment/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <PaymentPurchaseOrder />
                    </RoleProtectedRoute>
                } />
                <Route path="/purchase-order/complete/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi"]}>
                        <CompletePurchaseOrder />
                    </RoleProtectedRoute>
                } />

                <Route path="/sales-receipt" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <SalesReceipt/>
                    </RoleProtectedRoute>
                } />
                <Route path="/sales-receipt/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <SalesReceiptDetail />
                    </RoleProtectedRoute>
                } />
                <Route path="/purchase-receipt" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <PurchaseReceipt/>
                    </RoleProtectedRoute>
                } />
                <Route path="/purchase-receipt/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <PurchaseReceiptDetail />
                    </RoleProtectedRoute>
                } />

                <Route path="/shipping" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <ShippingList />
                    </RoleProtectedRoute>
                } />
                <Route path="/shipping/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <DetailShipping />
                    </RoleProtectedRoute>
                } />
                <Route path="/delivery-note" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <DeliveryList />
                    </RoleProtectedRoute>
                } />
                <Route path="/delivery/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <DetailDelivery />
                    </RoleProtectedRoute>
                } />

                <Route path="/purchase-invoice" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <PurchaseInvoice />
                    </RoleProtectedRoute>
                } />
                <Route path="/purchase-invoice/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <PurchaseInvoiceDetail />
                    </RoleProtectedRoute>
                } />
                <Route path="/sales-invoice" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <SalesInvoice />
                    </RoleProtectedRoute>
                } />
                <Route path="/sales-invoice/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <SalesInvoiceDetail />
                    </RoleProtectedRoute>
                } />

                <Route path="/delivery-invoice" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <PurchaseInvoice />
                    </RoleProtectedRoute>
                } />
                <Route path="/purchase-invoice/detail/:id" element={
                    <RoleProtectedRoute allowedRoles={["direktur", "general_manager", "sales", "administrasi", "komisaris"]}>
                        <PurchaseInvoiceDetail />
                    </RoleProtectedRoute>
                } />

                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/profile/update-password/:id" element={<UpdateProfile />} />
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