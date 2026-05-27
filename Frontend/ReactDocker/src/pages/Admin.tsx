import { useEffect, useState } from "react";
import "../styles/AdminPanel.css";

// PROXY URLS
const AUTH_API = "/api/auth";
const PRODUCT_API = "/api/products";
const ORDER_API = "/api/orders";

export default function AdminPanel() {

    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    const [isAdmin, setIsAdmin] =
        useState<boolean | null>(null);

    const [activeTab, setActiveTab] =
        useState("products");

    // PRODUCT FORM
    const [name, setName] = useState("");

    const [price, setPrice] = useState("");

    const [categorySlug, setCategorySlug] =
        useState("");

    const [image, setImage] =
        useState<File | null>(null);

    const token = localStorage.getItem("token");

    // =====================================
    // CHECK ADMIN
    // =====================================

    useEffect(() => {

        const checkAdmin = async () => {

            try {

                if (!token) {

                    setIsAdmin(false);

                    return;
                }

                const res = await fetch(
                    `${AUTH_API}/checkadmin`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                setIsAdmin(res.ok);

            } catch {

                setIsAdmin(false);
            }
        };

        checkAdmin();

    }, [token]);

    // =====================================
    // LOAD DATA
    // =====================================

    const loadData = async () => {

        try {

            // PRODUCTS
            const productsRes =
                await fetch(PRODUCT_API);

            const productsData =
                await productsRes.json();

            setProducts(productsData);

            // ORDERS
            const ordersRes =
                await fetch(
                    `${ORDER_API}/all`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const ordersData =
                await ordersRes.json();

            setOrders(ordersData);

            // USERS
            const usersRes =
                await fetch(
                    `${AUTH_API}/users`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const usersData =
                await usersRes.json();

            setUsers(usersData);

        } catch (err) {

            console.log(err);
        }
    };

    useEffect(() => {

        if (isAdmin) {

            loadData();
        }

    }, [isAdmin]);

    // =====================================
    // ADD PRODUCT
    // =====================================

    const addProduct = async () => {

        try {

            if (!image) {

                alert("Выберите изображение");

                return;
            }

            const formData = new FormData();

            formData.append("name", name);

            formData.append(
                "price",
                price.toString()
            );

            formData.append(
                "categorySlug",
                categorySlug
            );

            formData.append(
                "image",
                image
            );

            const response = await fetch(
                PRODUCT_API,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },

                    body: formData
                }
            );

            if (!response.ok) {

                const error =
                    await response.text();

                console.log(error);

                alert("Ошибка загрузки");

                return;
            }

            alert("Товар добавлен");

            // CLEAR FORM
            setName("");

            setPrice("");

            setCategorySlug("");

            setImage(null);

            loadData();

        } catch (err) {

            console.log(err);

            alert("Ошибка");
        }
    };

    // =====================================
    // DELETE PRODUCT
    // =====================================

    const deleteProduct = async (
        id: number
    ) => {

        try {

            await fetch(
                `${PRODUCT_API}/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            loadData();

        } catch (err) {

            console.log(err);
        }
    };

    // =====================================
    // LOADING
    // =====================================

    if (isAdmin === null) {

        return <h2>Загрузка...</h2>;
    }

    // =====================================
    // NO ACCESS
    // =====================================

    if (!isAdmin) {

        return (
            <div className="not-admin">
                Нет доступа
            </div>
        );
    }

    // =====================================
    // UI
    // =====================================

    return (

        <div className="admin-container">

            <h1>Админ панель</h1>

            <div className="tabs">

                <button
                    onClick={() =>
                        setActiveTab("products")
                    }
                >
                    Товары
                </button>

                <button
                    onClick={() =>
                        setActiveTab("orders")
                    }
                >
                    Заказы
                </button>

                <button
                    onClick={() =>
                        setActiveTab("users")
                    }
                >
                    Пользователи
                </button>

            </div>

            {/* PRODUCTS */}

            {activeTab === "products" && (

                <>

                    <div className="form">

                        <input
                            placeholder="Название"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                        />

                        <input
                            placeholder="Цена"
                            value={price}
                            onChange={(e) =>
                                setPrice(e.target.value)
                            }
                        />

                        <input
                            placeholder="Категория"
                            value={categorySlug}
                            onChange={(e) =>
                                setCategorySlug(
                                    e.target.value
                                )
                            }
                        />

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {

                                if (
                                    e.target.files?.[0]
                                ) {

                                    setImage(
                                        e.target.files[0]
                                    );
                                }
                            }}
                        />

                        <button onClick={addProduct}>
                            Добавить
                        </button>

                    </div>

                    <div className="grid">

                        {products.map((p) => (

                            <div
                                className="card"
                                key={p.id}
                            >

                                <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                />

                                <h3>{p.name}</h3>

                                <p>
                                    {p.price} грн
                                </p>

                                <div className="actions">

                                    <button
                                        onClick={() =>
                                            deleteProduct(
                                                p.id
                                            )
                                        }
                                    >
                                        Удалить
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>

                </>

            )}

            {/* ORDERS */}

            {activeTab === "orders" && (

                <div className="grid">

                    {orders.map((o: any) => (

                        <div
                            className="card"
                            key={o.id}
                        >

                            <h3>
                                {o.productName}
                            </h3>

                            <p>{o.status}</p>

                        </div>

                    ))}

                </div>

            )}

            {/* USERS */}

            {activeTab === "users" && (

                <div className="grid">

                    {users.map((u: any) => (

                        <div
                            className="card"
                            key={u.id}
                        >

                            <h3>{u.email}</h3>

                            <p>{u.userName}</p>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}