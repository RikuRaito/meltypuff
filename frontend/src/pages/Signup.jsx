import { useEffect, useState } from "react";
import React from "react";
import './Signup.css'

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [confirm, setConfirm] = useState('')

    // フォーム送信ハンドラー
    const handleSubmit = (e) => {
      e.preventDefault()
      // TODO: サインアップAPI呼び出し
      console.log({ email, password, confirm })
      // フォームクリア
      setEmail('')
      setPassword('')
      setConfirm('')
    }

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