import { useState } from "react";
import "../styles/Register.css";

const API_URL = "http://localhost:5001/api/auth";

export default function Register() {

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (form.password !== form.confirmPassword) {
            setError("Паролі мають співпадати!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password
                    // если у тебя в беке есть name:
                    // userName: form.name
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Помилка реєстрації");
            }

            // 🔥 сохраняем токен если есть
            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            setSuccess("Вас успішно зареєстровано!");

            setForm({
                name: "",
                email: "",
                password: "",
                confirmPassword: ""
            });

            setTimeout(() => {
                window.location.href = "/";
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Помилка підключення до сервера");
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">

                <h2>Реєстрація</h2>

                <form onSubmit={handleSubmit}>

                    <label>Ім'я</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Пароль</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <label>Підтвердити пароль</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {success && <p style={{ color: "green" }}>{success}</p>}

                    <button type="submit">
                        Зареєструватись
                    </button>

                </form>

            </div>
        </div>
    );
}