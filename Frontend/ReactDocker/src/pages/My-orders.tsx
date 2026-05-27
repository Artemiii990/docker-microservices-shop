import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

const API_URL = "http://localhost:5003";

type Order = {
    id: number;
    productName: string;
    quantity: number;
    price: number;
    date: string;
    status: string;
};

export default function MyOrders() {

    const [orders, setOrders] = useState<Order[]>([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const fetchOrders = async () => {

        try {

            const res = await fetch(
                `${API_URL}/api/orders/myorders`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) {
                throw new Error("Помилка завантаження замовлень");
            }

            const data = await res.json();
            setOrders(data);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {

        if (!token) {
            navigate("/login");
            return;
        }

        fetchOrders();

    }, []);

    const cancelOrder = async (orderId: number) => {

        if (!confirm("Скасувати замовлення?")) return;

        try {

            const res = await fetch(
                `${API_URL}/api/orders/${orderId}/cancel`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) {
                throw new Error("Помилка скасування");
            }

            fetchOrders();

        } catch (err) {
            console.error(err);
            alert("Не вдалося скасувати замовлення");
        }
    };

    return (
        <div className="profile-page">

            <div className="profile-container">

                <h2>Мої замовлення</h2>

                {orders.length === 0 ? (
                    <p>У вас поки немає замовлень</p>
                ) : (

                    <table>

                        <thead>
                        <tr>
                            <th>№</th>
                            <th>Товар</th>
                            <th>Кіл-сть</th>
                            <th>Ціна</th>
                            <th>Дата</th>
                            <th>Статус</th>
                            <th>Дія</th>
                        </tr>
                        </thead>

                        <tbody>

                        {orders.map((order, index) => (

                            <tr key={order.id}>

                                <td>{index + 1}</td>

                                <td>{order.productName}</td>

                                <td>{order.quantity}</td>

                                <td>{order.price} грн</td>

                                <td>
                                    {new Date(order.date).toLocaleDateString()}
                                </td>

                                <td>
                                    <span className={`status ${order.status}`}>
                                        {order.status}
                                    </span>
                                </td>

                                <td>

                                    {order.status === "Processing" && (

                                        <button
                                            onClick={() => cancelOrder(order.id)}
                                        >
                                            Скасувати
                                        </button>

                                    )}

                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                )}

            </div>

        </div>
    );
}