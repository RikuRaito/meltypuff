import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import './Dashboard.css'

const Dashboard = () => {
    const [orderData, setOrderData] = useState([])
    const [openId, setOpenId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const email = localStorage.getItem('adminEmail')
        if (!email) {
            console.log('You need to log in')
            navigate('/DashLogin:MeltyPuff')
        }
    }, [navigate]);

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
                const list = Array.isArray(data.orders) ? data.orders : data;
                list.sort((a, b) => {
                    const dateA = new Date(a.update_at || a.updated_at || 0);
                    const dateB = new Date(b.update_at || b.updated_at || 0);
                    return dateB - dateA;
                });
                setOrderData(list);

            } catch(err) {
                console.error('Error fatching orders:', err);
            }
        };
        fetchOrders();
    }, []);

    const toggle = (id) => {
        setOpenId((prev) => (prev === id ? null: id));
    };

    const fmtDate = (iso) =>
        iso ? new Date(iso).toLocaleString("ja-JP") : "-"

      return (
    <div className="Dashboard-wrapper">
      <h1>ダッシュボード</h1>
      <ul className="order-list">
        {orderData.map((order) => (
          <li key={order.order_id} className="order-item">
            <button
              className="order-summary"
              onClick={() => toggle(order.order_id)}
            >
              <span className="order-id">{order.order_id}</span>
              <span className="order-date">
                {fmtDate(order.update_at)}
              </span>
              <span className="order-name">{order.name}</span>
            </button>

            {openId === order.order_id && (
              <div className="order-detail">
                <p>Status: {order.status}</p>
                {(order.update_at) && (
                  <p>Confirmed at: {fmtDate(order.updated_at || order.update_at)}</p>
                )}
                <p>Email: {order.email}</p>
                <p>Phone: {order.phone}</p>
                <p>
                  Address: {order.address1} {order.address2}
                </p>
                <p>Amount: ¥{order.amount.toLocaleString()}</p>
                <h4>Items:</h4>
                <ul>
                  {order.items.map((itm, idx) => (
                    <li key={idx}>
                      ID: {itm.id} / Qty: {itm.qty}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;