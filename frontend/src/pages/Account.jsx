import React, { useState, useEffect } from "react";
import './Account.css'

const Account = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError]       = useState(null);
  const [address_num, setAddress_num] = useState('');
  const [address_1, setAddress_1] = useState('');
  const [address_2, setAddress_2] = useState('');

  useEffect(() => {
    // マウント時にAPIからアカウント情報を取得
    const email = localStorage.getItem('email')
    if (!email) {
        setError('ログインしてください');
        return;
    }
    fetch(`/api/account?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include"     // 必要に応じて
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load account data");
        return res.json();
      })
      .then(data => {
        setUserInfo(data);
        setAddress_num(data.address_num || '');
        setAddress_1(data.address_1 || '');
        setAddress_2(data.address_2 || '');
      })
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div className="account-error">エラー: {error}</div>;
  if (!userInfo) return <div className="account-loading">読み込み中…</div>;

  // 住所情報更新
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const email = localStorage.getItem('email');
      const res = await fetch('/api/account_update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          address_num,
          address_1,
          address_2
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || '更新に失敗しました');
      }
      const updated = await res.json();
      // 成功したら画面も更新
      setUserInfo(updated);
      alert('アカウント情報を更新しました');
    } catch (err) {
      alert(`更新エラー: ${err.message}`);
    }
  };

  return (
    <div className="account-container">
      <h2>マイアカウント情報</h2>
      <p><strong>ID:</strong> {userInfo.id}</p>
      <p><strong>メール:</strong> {userInfo.email}</p>
      <div className="account-field">
        <label>郵便番号:</label>
        <input
          type="text"
          value={address_num}
          onChange={e => setAddress_num(e.target.value)}
        />
      </div>
      <div className="account-field">
        <label>住所1:</label>
        <input
          type="text"
          value={address_1}
          onChange={e => setAddress_1(e.target.value)}
        />
      </div>
      <div className="account-field">
        <label>住所2:</label>
        <input
          type="text"
          value={address_2}
          onChange={e => setAddress_2(e.target.value)}
        />
      </div>
      <button
        className="account-update-button"
        onClick={handleUpdate}
      >
        更新する
      </button>
    </div>
  );
}

export default Account