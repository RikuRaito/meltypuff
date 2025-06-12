import { useEffect, useState } from "react";
import React from "react";
import './Signup.css'

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [confirm, setConfirm] = useState('')

    // フォーム送信ハンドラー
    const handleSubmit = async (e) => {
      e.preventDefault()
      if (password !== confirm) {
        alert("パスワードが一致しません")
        return
      }
      console.log({ email, password, confirm })

      try{ 
        const res = await fetch('/api/signup', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password
          }),
        });
        if (!res.ok) {
          const errorData = await res.json()
          console.error("登録エラー",errorData);
          alert(erroData.message || "サインアップに失敗しました")
          return;
        }
        const data = await res.json();
        console.log("登録成功", data);
        alert("登録完了")

        // フォームクリア
        setEmail('')
        setPassword('')
        setConfirm('')
      } catch (err) {
        console.log("通信エラー",err);
        alert("通信エラー")
      }
    };

    return (
      <div className="signup-wrapper">
        <form className="signup-container" onSubmit={handleSubmit}>
          <h1 className="signup-title">MeltyPuff サインアップ</h1>

          <div className="input-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              className="input-email"
              placeholder="example@domain.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              className="input-password"
              placeholder="********"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirm">パスワード確認</label>
            <input
              id="confirm"
              type="password"
              className="input-confirm"
              placeholder="********"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="signup-button">アカウント作成</button>
        </form>
      </div>
    )
}

export default Signup