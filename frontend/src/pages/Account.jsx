import React, { useState, useEffect } from "react";
import './Account.css'

const Account = ({ user, onLogout }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError]       = useState(null);
  const [phone, setPhone] = useState();
  const [address_num, setAddress_num] = useState('');
  const [address_1, setAddress_1] = useState('');
  const [address_2, setAddress_2] = useState('');

  // 郵便番号から住所を自動取得
  const lookupAddress = () => {
    const zipcode = address_num.replace('-', '').trim();
    if (!zipcode) return;
    fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`)
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results[0]) {
          const r = data.results[0];
          // r.address1: 都道府県, r.address2: 市区町村, r.address3: 町域
          setAddress_1(`${r.address1}${r.address2}`);
          setAddress_2(r.address3);
        }
      })
      .catch(err => console.error('郵便番号検索エラー:', err));
  };

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
        setPhone(data.phone || '');
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
          phone,
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
      <p><strong>メールアドレス:</strong> {userInfo.email}</p>
      <div className="account-field">
        <label className="phone-number">電話番号:</label>
        <input
            type="phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="例: 090-1234-5678"
        />
      </div>
      <div className="account-field">
        <label className="post-code">郵便番号:</label>
        <input
          type="text"
          value={address_num}
          onChange={e => setAddress_num(e.target.value)}
          placeholder="123-4567"
          onBlur={lookupAddress}
        />
      </div>
      <div className="account-field">
        <label className="address_1">都道府県・市区町村</label>
        <input
          type="text"
          value={address_1}
          onChange={e => setAddress_1(e.target.value)}
          placeholder="例: 東京都千代田区"
        />
      </div>
      <div className="account-field">
        <label className="address_2">詳細住所</label>
        <input
          type="text"
          value={address_2}
          onChange={e => setAddress_2(e.target.value)}
          placeholder="例: 1-1-1"
        />
      </div>
      <button
        className="account-update-button"
        onClick={handleUpdate}
      >
        更新する
      </button>
      <button
        className="account-logout-button"
        onClick={() => onLogout()}
        >ログアウト</button>
    </div>
  );
}

export default Account