import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/backLeftSide.css";

const API_URL = "http://localhost:5001";

export default function Sidebar() {

    const [isOpen, setIsOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    useEffect(() => {

        const checkAdmin = async () => {

            const token = localStorage.getItem("token");

            if (!token) {
                setIsAdmin(false);
                return;
            }

            try {

                const res = await fetch(
                    `${API_URL}/api/auth/checkadmin`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!res.ok) {
                    setIsAdmin(false);
                    return;
                }

                const data = await res.json();

                setIsAdmin(data.isAdmin); // ✅ реальная проверка

            } catch (err) {
                console.error(err);
                setIsAdmin(false);
            }
        };

        checkAdmin();

    }, []);

    return (
        <>
            <div className={`LeftSidebar ${isOpen ? "open" : ""}`}>

                <h3>
                    <img
                        src="https://yellow.ua/media/logo/default/Black_1.svg"
                        alt="logo"
                    />
                </h3>

                <ul>

                    {/* Админ */}
                        <li>
                            <Link to="/admin">Адмін-Панель</Link>
                        </li>
                    <li>
                        <Link to="/profile">
                            Ваші замовлення / Профіль
                        </Link>
                    </li>

                    <li>
                        <Link to="/kosik">Кошик</Link>
                    </li>

                </ul>

            </div>

            {isOpen && (
                <div
                    className="overlay"
                    onClick={toggleSidebar}
                ></div>
            )}
        </>
    );
}