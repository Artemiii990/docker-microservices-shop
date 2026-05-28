import { useState } from "react";
import "../styles/Register.css";
import { API_REGISTER } from "../api/source.ts";

const API_URL = API_REGISTER;

export default function Register() {

    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            form.password !==
            form.confirmPassword
        ) {
            setError(
                "Паролі мають співпадати!"
            );

            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: form.email,
                        password: form.password
                    })
                }
            );

            // 🔥 FIX JSON ERROR
            const text =
                await response.text();

            const data =
                text
                    ? JSON.parse(text)
                    : {};

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Помилка реєстрації"
                );
            }

            // TOKEN
            if (data.token) {

                localStorage.setItem(
                    "token",
                    data.token
                );
            }

            setSuccess(
                "Вас успішно зареєстровано!"
            );

            setForm({
                email: "",
                password: "",
                confirmPassword: ""
            });

            setTimeout(() => {

                window.location.href = "/";

            }, 1500);

        } catch (err: any) {

            console.error(err);

            setError(
                err.message ||
                "Помилка підключення до сервера"
            );
        }
    };

    return (

        <div className="register-page">

            <div className="register-container">

                <h2>Реєстрація</h2>

                <form onSubmit={handleSubmit}>

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

                    <label>
                        Підтвердити пароль
                    </label>

                    <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    {error && (
                        <p style={{ color: "red" }}>
                            {error}
                        </p>
                    )}

                    {success && (
                        <p style={{ color: "green" }}>
                            {success}
                        </p>
                    )}

                    <button type="submit">
                        Зареєструватись
                    </button>

                </form>

            </div>

        </div>
    );
}