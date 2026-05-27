import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

const API_URL = "http://localhost:5001";

type Props = {
    setToken: (token: string) => void;
};

export default function Login({ setToken }: Props) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {

            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                throw new Error("Невірний логін або пароль");
            }

            const data = await res.json();

            localStorage.setItem("token", data.token);
            setToken(data.token);

            alert("Вхід успішний");

            navigate("/profile");

        } catch (err: any) {
            console.error(err);
            alert(err.message || "Помилка входу");
        }
    };

    return (
        <div className="login-page">

            <div className="login-container">

                <h2>Вхід</h2>

                <form onSubmit={handleSubmit} className="login-form">

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="submit">
                        Увійти
                    </button>

                </form>

                <Link to="/register">
                    <button className="submit">
                        Зареєструватись
                    </button>
                </Link>

            </div>

        </div>
    );
}