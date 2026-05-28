import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Profile.css";
import {API_AUTH} from "../api/source.ts"


const API_URL = API_AUTH;

export default function Profile() {

    const [userName, setUserName] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const fetchUser = async () => {

        try {

            const res = await fetch(
                `${API_URL}/api/auth/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) {
                throw new Error("Не вдалося отримати користувача");
            }

            const data = await res.json();
            setUserName(data.userName);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {

        if (!token) {
            navigate("/login");
            return;
        }

        fetchUser();

    }, []);

    const handleLogout = () => {

        localStorage.removeItem("token");
        navigate("/login");

    };

    return (
        <div className="profile-page">

            <div className="profile-layout">

                <div className="profile-sidebar">

                    <img
                        src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                        width="80"
                        alt="avatar"
                    />

                    <h3>Вітаємо</h3>

                    <p>{userName}</p>

                    <button onClick={handleLogout}>
                        Вийти
                    </button>

                </div>

                <div className="profile-content">

                    <h2>Профіль</h2>

                    <p>Ім'я користувача: {userName}</p>

                    <Link to="/my-orders">
                        <button className="submit">
                            Мої замовлення
                        </button>
                    </Link>

                </div>

            </div>

        </div>
    );
}