import React, {useState} from 'react';
import './Login.css'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const Login = async (e) => {
        e.preventDefault();
        console.log(email,password)
    }
    return (
        <div className="login-container">
            <h1 className="login-title">ログイン</h1>
            <div className="input-container">
                <h2 className="email">メールアドレス</h2>
                    <input 
                    type="email"
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="input-email"
                    />
                <h2 className="password">パスワード</h2>
                    <input
                        type="password"
                        onChange={e => setPassword(e.target.value)}
                        className="input-password"
                    />
                <button onClick={Login}>送信</button>
            </div>
        </div>
        
            
    )
}

export default Login