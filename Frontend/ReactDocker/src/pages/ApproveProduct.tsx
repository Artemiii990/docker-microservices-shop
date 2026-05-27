import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/ApproveProduct.css";

const API_URL = "http://localhost:5003";

export default function Approved() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(
                    `${API_URL}/api/orders/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error("Не удалось получить заказ");
                }

                const data = await res.json();
                setOrder(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="approved-overlay">
                <div className="approved-modal">
                    <h2>Загрузка...</h2>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="approved-overlay">
                <div className="approved-modal">
                    <h2>Заказ не найден</h2>
                    <button onClick={() => navigate("/")}>
                        Вернуться в магазин
                    </button>
                </div>
            </div>
        );
    }

    const total = order.price * order.quantity;

    return (
        <div className="approved-overlay">

            <div className="approved-modal">

                <h2 className="approved-title">
                    🎉 Заказ успешно оформлен!
                </h2>

                <p className="approved-order">
                    Номер заказа: <b>#{order.id}</b>
                </p>

                <h3 className="approved-product">
                    {order.productName}
                </h3>

                <p className="approved-info">
                    Количество: <b>{order.quantity}</b>
                </p>

                <p className="approved-info">
                    Цена за штуку: <b>{order.price} грн</b>
                </p>

                <p className="approved-total">
                    Итого: <b>{total} грн</b>
                </p>

                <p className="approved-date">
                    Дата: {new Date(order.date).toLocaleString()}
                </p>

                <p className="approved-status">
                    Статус: <b>{order.status}</b>
                </p>

                <div className="approved-actions">

                    <button
                        className="approved-button"
                        onClick={() => navigate("/")}
                    >
                        В магазин
                    </button>

                    <button
                        className="approved-secondary"
                        onClick={() => navigate("/profile")}
                    >
                        Мои заказы
                    </button>

                </div>

            </div>

        </div>
    );
}