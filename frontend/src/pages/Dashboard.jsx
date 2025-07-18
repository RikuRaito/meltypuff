import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import './Dashboard.css'

const Dashboard = () => {
    const [orderData, setOrderData] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        const email = localStorage.getItem('adminEmail')
        if (!email) {
            console.log('You need to log in')
            window.location.href = '/DashLogin:MeltyPuff'
        }
    })

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/get_order', {
                    method: 'GET',
                });
                if (!res.ok) {
                    console.log('Failed to load order', res.status);
                    return;
                }
                const data = await res.json()
                setOrderData(Array.isArray(data.orders) ? data.orders : data);
            } catch(err) {
                console.error('Error fatching orders:', err);
            }
        };
        fetchOrders();
    }, []);
    return (
        <div className="Dashboard-wrapper">
            <h1>ダッシュボード</h1>
            <ul>
                {orderData.map(order => (
                    <p key={order.order_id} className="order_list">
                        {order.order_id}

                    </p>
                ))}
            </ul>
        </div>

    )
}

export default Dashboard