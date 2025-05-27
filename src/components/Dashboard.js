import { useState, useEffect } from "react";
import axiosInstance from "../services/axiosInstance";
import "../styles/Dashboard.css";
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, ScatterChart, Scatter,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

const Dashboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [entity, setEntity] = useState("sales_order");
    const [x, setX] = useState("salesDate");
    const [y, setY] = useState("totalPrice");
    const [aggregation, setAggregation] = useState("sum");
    const [chartType, setChartType] = useState("line");

    const [allCustomers, setAllCustomers] = useState([]);
    const [allBarang, setAllBarang] = useState([]);
    const [allGudang, setAllGudang] = useState([]);

    const [filter, setFilter] = useState({
        startDate: "",
        endDate: "",
        statusList: [],
        barangIds: [],
        gudangIds: [],
        customerIds: []
    });

    const getVisibleFilters = (entity) => {
        switch (entity) {
            case "barang": return ["tanggal", "gudang", "chart"];
            case "gudang": return ["tanggal", "barang", "chart"];
            case "status": return ["tanggal", "chart"];
            default: return ["tanggal", "parameter", "status_customer", "barang", "gudang", "chart", "agregasi"];
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                entity,
                x: entity === "status" ? "salesDate" : x,
                y: entity === "status" ? "id" : y,
                aggregation: entity === "status" ? "count" : aggregation,
                filter,
            };

            const response = await axiosInstance.post("/api/dashboard/get-data", payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setData(response.data.data.data);
        } catch (err) {
            setError("Gagal mengambil data dashboard.");
        } finally {
            setLoading(false);
        }
    };

    const fetchFilters = async () => {
        try {
            const [barangRes, gudangRes, customerRes] = await Promise.all([
                axiosInstance.get("/api/barang/viewall", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }),
                axiosInstance.get("/api/gudang/", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }),
                axiosInstance.get("/api/customer/viewall", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                })
            ]);

            setAllBarang(barangRes.data.data);
            setAllGudang(gudangRes.data.data);
            const role = entity === "purchase_order" ? "VENDOR" : "CUSTOMER";
            setAllCustomers(customerRes.data.data.filter(c => c.role === role));
        } catch (err) {
            console.error("Gagal load data filter:", err);
        }
    };

    const parameterXOptions = entity === "sales_order"
        ? [
            { label: "Tanggal Sales", value: "salesDate" },
            { label: "Tanggal Invoice", value: "invoice.invoiceDate" },
            { label: "Tanggal Shipping", value: "shipping.shippingDate" },
            { label: "Tanggal Nota", value: "receipt.receiptDate" },
            { label: "Tanggal Payment", value: "payment.paymentDate" }
        ]
        : [
            { label: "Tanggal Purchase", value: "purchaseDate" },
            { label: "Tanggal Invoice", value: "invoice.invoiceDate" },
            { label: "Tanggal Delivery", value: "delivery.deliveryDate" },
            { label: "Tanggal Nota", value: "receipt.receiptDate" },
            { label: "Tanggal Payment", value: "payment.paymentDate" }
        ];

    const parameterYOptions = entity === "sales_order"
        ? [
            { label: "Total Harga SO", value: "totalPrice" },
            { label: "Shipping Fee", value: "shipping.shippingFee" },
            { label: "Total Invoice", value: "invoice.totalAmount" },
            { label: "Pembayaran", value: "payment.totalAmountPayed" }
        ]
        : [
            { label: "Total Harga PO", value: "totalPrice" },
            { label: "Delivery Fee", value: "delivery.deliveryFee" },
            { label: "Total Invoice", value: "invoice.totalAmount" },
            { label: "Pembayaran", value: "payment.totalAmountPayed" }
        ];

    const statusOptions = entity === "sales_order"
        ? ["CREATED", "CONFIRMED", "COMPLETED", "IN SHIPPING", "SHIPPED"]
        : ["CREATED", "CONFIRMED", "COMPLETED", "IN DELIVERY", "DELIVERED"];

    const handleMultiSelectChange = (e, field) => {
        const selected = Array.from(e.target.selectedOptions, opt => opt.value);
        setFilter(prev => ({ ...prev, [field]: selected }));
    };

    const resetFilters = () => {
        setX("salesDate");
        setY("totalPrice");
        setAggregation("sum");
        setChartType("line");

        setFilter({
            entity: "sales_order",
            startDate: "",
            endDate: "",
            statusList: [],
            barangIds: [],
            gudangIds: [],
            customerIds: []
        });

        setEntity("sales_order");
        setTimeout(() => {
            setEntity("sales_order");
        }, 0);
    };

    const getAxisLabel = (field, aggregation, entity) => {
        if (entity === "status") {
            return aggregation === "count" ? "Jumlah" : "Nilai";
        }

        if (aggregation === "count") return "Jumlah";
        if (field.toLowerCase().includes("price")) return "Harga (Rp)";
        if (field.toLowerCase().includes("fee")) return "Harga (Rp)";
        if (field.toLowerCase().includes("amount")) return "Harga (Rp)";
        if (field.toLowerCase().includes("quantity")) return "Jumlah";
        if (field.toLowerCase().includes("date")) return "Bulan";
        return "Nilai";
    };


    const pieColors = ['#F39C12', '#3498DB', '#2ECC71', '#E74C3C', '#9B59B6', '#1ABC9C', '#34495E', '#E67E22'];

    const resetParamsByEntity = (selectedEntity) => {
        if (selectedEntity === "sales_order") {
            setX("salesDate");
            setY("totalPrice");
            setAggregation("sum");
        } else if (selectedEntity === "purchase_order") {
            setX("purchaseDate");
            setY("totalPrice");
            setAggregation("sum");
        } else if (selectedEntity === "status") {
            setX("salesDate");
            setY("id");
            setAggregation("count");
        } else {
            setX("x");
            setY("y");
            setAggregation("sum");
        }

        setChartType("line");
    };

    const renderChart = () => {
        const chartProps = {
            data,
            margin: { top: 10, right: 30, left: 40, bottom: 40 }
        };

        const xLabel = getAxisLabel(x, aggregation, entity);
        const yLabel = getAxisLabel(y, aggregation, entity);

        switch (chartType) {
            case "bar":
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart {...chartProps}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="x"
                                type="category"
                                interval={0}
                                tick={{ fontSize: 12 }}
                                label={{
                                    value: xLabel,
                                    position: "insideBottom",
                                    dy: 20,
                                    style: { fill: "#F39C12", fontSize: 14, fontWeight: "bold" }
                                }}
                            />
                            <YAxis
                                type="number"
                                tick={{ fontSize: 12 }}
                                tickFormatter={v => new Intl.NumberFormat("id-ID").format(v)}
                                label={{
                                    value: yLabel,
                                    angle: -90,
                                    position: "insideLeft",
                                    dy: -10,
                                    style: { fill: "#F39C12", fontSize: 14, fontWeight: "bold" }
                                }}
                            />
                            <Tooltip formatter={v => new Intl.NumberFormat("id-ID").format(v)} />
                            <Legend />
                            <Bar dataKey="y" fill="#F39C12" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case "area":
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart {...chartProps}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="x"
                                type="category"
                                interval={0}
                                tick={{ fontSize: 12 }}
                                label={{
                                    value: xLabel,
                                    position: "insideBottom",
                                    dy: 20,
                                    style: { fill: "#F39C12", fontSize: 14, fontWeight: "bold" }
                                }}
                            />
                            <YAxis
                                type="number"
                                tick={{ fontSize: 12 }}
                                tickFormatter={v => new Intl.NumberFormat("id-ID").format(v)}
                                label={{
                                    value: yLabel,
                                    angle: -90,
                                    position: "insideLeft",
                                    dy: -10,
                                    style: { fill: "#F39C12", fontSize: 14, fontWeight: "bold" }
                                }}
                            />
                            <Tooltip formatter={v => new Intl.NumberFormat("id-ID").format(v)} />
                            <Legend />
                            <Area type="monotone" dataKey="y" stroke="#F39C12" fill="#FAD7A0" />
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case "scatter":
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <ScatterChart margin={{ top: 10, right: 30, left: 40, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="x"
                                type="category"
                                tick={{ fontSize: 12 }}
                                label={{
                                    value: yLabel,
                                    angle: -90,
                                    position: "insideLeft",
                                    dy: -10,
                                    style: { fill: "#F39C12", fontSize: 14, fontWeight: "bold" }
                                }}
                            />
                            <YAxis
                                dataKey="y"
                                tick={{ fontSize: 12 }}
                                tickFormatter={v => new Intl.NumberFormat("id-ID").format(v)}
                                label={{
                                    value: yLabel,
                                    angle: -90,
                                    position: "insideLeft",
                                    dy: -10,
                                    style: { fill: "#F39C12", fontSize: 14, fontWeight: "bold" }
                                }}
                            />
                            <Tooltip formatter={v => new Intl.NumberFormat("id-ID").format(v)} />
                            <Legend />
                            <Scatter name="Nilai" data={data} fill="#F39C12" />
                        </ScatterChart>
                    </ResponsiveContainer>
                );

            case "pie":
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Tooltip formatter={v => new Intl.NumberFormat("id-ID").format(v)} />
                            <Legend />
                            <Pie
                                data={data}
                                dataKey="y"
                                nameKey="x"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                label
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                );

            default:
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart {...chartProps}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="x"
                                type="category"
                                interval={0}
                                tick={{ fontSize: 12 }}
                                label={{
                                    value: xLabel,
                                    position: "insideBottom",
                                    dy: 20,
                                    style: { fill: "#F39C12", fontSize: 14, fontWeight: "bold" }
                                }}
                            />
                            <YAxis
                                type="number"
                                tick={{ fontSize: 12 }}
                                tickFormatter={v => new Intl.NumberFormat("id-ID").format(v)}
                                label={{
                                    value: yLabel,
                                    angle: -90,
                                    position: "insideLeft",
                                    dy: -10,
                                    style: { fill: "#F39C12", fontSize: 14, fontWeight: "bold" }
                                }}
                            />
                            <Tooltip formatter={v => new Intl.NumberFormat("id-ID").format(v)} />
                            <Legend />
                            <Line type="monotone" dataKey="y" stroke="#F39C12" />
                        </LineChart>
                    </ResponsiveContainer>
                );
        }
    };

    useEffect(() => {
        fetchFilters();
    }, [entity]);

    useEffect(() => {
        fetchData();
    }, [entity, x, y, aggregation, filter]);

    return (
        <div className="gudang-detail-content">
            <div className="page-header"><h1 className="page-title">Dashboard</h1></div>
            <div className="detail-card">
                <div className="section-header"><h2 className="section-title">Filter Dashboard</h2></div>
                <div className="section-content">
                    <div className="detail-row">
                        <div className="detail-label">Entity:</div>
                        <select
                            value={entity}
                            onChange={e => {
                                const selected = e.target.value;
                                resetParamsByEntity(selected);
                                setEntity(selected); // <- setelah reset param
                                setFilter({
                                    startDate: "",
                                    endDate: "",
                                    statusList: [],
                                    barangIds: [],
                                    gudangIds: [],
                                    customerIds: []
                                });
                            }}
                        >
                            <option value="sales_order">Sales Order</option>
                            <option value="purchase_order">Purchase Order</option>
                            <option value="barang">Barang</option>
                            <option value="gudang">Gudang</option>
                            <option value="status">Status</option>
                        </select>
                    </div>

                    {getVisibleFilters(entity).includes("tanggal") && (
                        <div className="detail-row">
                            <div className="detail-label">Tanggal:</div>
                            <div style={{ display: "flex", gap: "10px", flex: 1 }}>
                                <input type="date" value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })} />
                                <input type="date" value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })} />
                            </div>
                        </div>
                    )}

                    {getVisibleFilters(entity).includes("parameter") && (
                        <div className="detail-row">
                            <div className="detail-label">Parameter:</div>
                            <div style={{ display: "flex", gap: "10px", flex: 1 }}>
                                <select value={x} onChange={e => setX(e.target.value)}>
                                    {parameterXOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                                <select value={y} onChange={e => setY(e.target.value)}>
                                    {parameterYOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {getVisibleFilters(entity).includes("status_customer") && (
                        <div className="detail-row">
                            <div className="detail-label">Status / Customer:</div>
                            <div style={{ display: "flex", gap: "10px", flex: 1 }}>
                                <select multiple value={filter.statusList} onChange={e => handleMultiSelectChange(e, "statusList")}>
                                    {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                                </select>
                                <select multiple value={filter.customerIds} onChange={e => handleMultiSelectChange(e, "customerIds")}>
                                    {allCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {getVisibleFilters(entity).includes("barang") && (
                        <div className="detail-row">
                            <div className="detail-label">Barang:</div>
                            <select multiple value={filter.barangIds} onChange={e => handleMultiSelectChange(e, "barangIds")}>
                                {allBarang.map(barang => <option key={barang.id} value={barang.id}>{barang.nama}</option>)}
                            </select>
                        </div>
                    )}

                    {getVisibleFilters(entity).includes("gudang") && (
                        <div className="detail-row">
                            <div className="detail-label">Gudang:</div>
                            <select multiple value={filter.gudangIds} onChange={e => handleMultiSelectChange(e, "gudangIds")}>
                                {allGudang.map(gudang => <option key={gudang.nama} value={gudang.nama}>{gudang.nama}</option>)}
                            </select>
                        </div>
                    )}

                    {getVisibleFilters(entity).includes("chart") && (
                        <div className="detail-row">
                            <div className="detail-label">Jenis Grafik:</div>
                            <div style={{ display: "flex", gap: "10px", flex: 1 }}>
                                <select value={chartType} onChange={e => setChartType(e.target.value)}>
                                    <option value="line">Line</option>
                                    <option value="bar">Bar</option>
                                    <option value="area">Area</option>
                                    <option value="pie">Pie</option>
                                    <option value="scatter">Scatter</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {getVisibleFilters(entity).includes("agregasi") && (
                        <div className="detail-row">
                            <div className="detail-label">Agregasi:</div>
                            <div style={{ display: "flex", gap: "10px", flex: 1 }}>
                                <select value={aggregation} onChange={e => setAggregation(e.target.value)}>
                                    <option value="sum">Sum</option>
                                    <option value="avg">Average</option>
                                    <option value="min">Min</option>
                                    <option value="max">Max</option>
                                    <option value="count">Count</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="action-buttons">
                        <button className="update-btn" onClick={fetchData}>Filter</button>
                        <button className="back-btn" onClick={resetFilters}>Refresh</button>
                    </div>
                </div>
            </div>

            <div className="detail-card">
                <div className="section-header">
                    <h2 className="section-title">Dashboard</h2>
                    <p style={{ marginLeft: "20px", color: "#6c757d", fontSize: "14px" }}>
                        {entity === "status"
                            ? "Jumlah Order berdasarkan Status"
                            : `X: ${getAxisLabel(x)} | Y: ${getAxisLabel(y)} | Agregasi: ${aggregation.toUpperCase()}`}
                    </p>
                </div>
                <div className="section-content">
                    {loading ? (
                        <div className="loading-container"><span className="loading-text">Memuat data...</span></div>
                    ) : error ? (
                        <div className="error-container"><span className="error-text">{error}</span></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            {renderChart()}
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
