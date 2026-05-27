import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Admin from "./pages/Admin"
import Header from "./components/Header"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import Approved from "./pages/ApproveProduct.tsx"
import {useEffect, useState} from "react";
import LeftSide from "./pages/backLeftSide.tsx"
import SearchResult from "./pages/SearchResult"
import Buy from "./pages/BuyProduct"
import MyOrders from "./pages/My-orders.tsx"
import Kosik from "./pages/Kosik.tsx"
import CategoryPage from "./pages/CategoryPage.tsx";

function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

    useEffect(() => {
        const saved = localStorage.getItem("token");
        if (saved) setToken(saved);
    }, []);

    return (
        <BrowserRouter>

            <Header />

            <Routes>
                <Route path="/" element={<Home token={token}/>} />
                <Route path="/login" element={<Login setToken={setToken}/>} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/backLeftSide" element={<LeftSide />} />
                <Route path="/searchresult" element={<SearchResult />} />
                <Route path="/approved/:id" element={<Approved />} />
                <Route path="/buyproduct" element={<Buy />}/>
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/kosik" element={<Kosik />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
            </Routes>

        </BrowserRouter>
    )
}

export default App