const getUserEmail = () => {
  return localStorage.getItem('isLoggedIn') === 'true'
    ? localStorage.getItem('email')
    : null;
}

import React, { useEffect, useState} from "react";
import './History.css'

const History = () => {
    const [histories, setHistories] = useState([])

    useEffect(() => {
        const email = getUserEmail();
        if (email) return;
        fetch(`/api/history?email=${encodeURIComponent(email)}`,{
            method: 'GET',
            headers: { 'Content_Type': 'application/json'},
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to load order history");
            return res.json();
        })
        .then(data => {
            if (data.status === 'Success') {
                setHistories(data.orders);
            } else {
                console.log('History API error', data.message)
            }
        })
        .catch(err => console.error('Fetch history error:', err));
    }, []);

    // Render the histories
    return (
      <div className="history-page">
        <h2>注文履歴</h2>
        {histories.length === 0 ? (
          <p>注文履歴はありません。</p>
        ) : (
          histories.map(order => (
            <div key={order.order_id} className="order-card">
              <p>注文ID: {order.order_id}</p>
              <p>合計金額: ¥{order.amount}</p>
              <p>ステータス: {order.status}</p>
              <div>
                <strong>アイテム:</strong>
                <ul>
                  {order.items.map(item => (
                    <li key={item.id}>
                      商品ID {item.id} × {item.qty}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    );
}

export default History;