import React, {useState} from 'react';
import './Login.css'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(email,password)
    }
    
  return (
    <div className="login-wrapper">
      <form className="login-container" onSubmit={handleSubmit}>
        <h1 className="login-title">ログイン</h1>

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

        <button type="submit" className="login-button">ログイン</button>
        {/* サインアップへのリンク */}
        <p className="signup-prompt">
          新規登録はこちら:&nbsp;
          <a href="/signup" className="signup-link">アカウント作成</a>
        </p>
      </form>
    </div>
   );
}

export default Login