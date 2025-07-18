import React, {useState} from 'react';
import './Login.css'

const Login = ({navigateTo, onLogin}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(email,password)
        try {
          const res = await fetch('/api/login', {
            method:'POST',
            headers:{
              "Content-Type": 'application/json'
            },
            body: JSON.stringify({
              email,
              password
            }),
          });
          if (!res.ok){
            const errorData =  await res.json()
            console.log('ログインエラー', errorData)
            alert('ログインに失敗しました')
            return;
          }

          const data = await res.json();
          if (data.status === 'Success'){
          console.log('ログイン成功', data)
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('email', email)
          if(onLogin){
            onLogin(data.user || {});
          }
          navigateTo('/')
          }
          else if(data.status === 'Failed'){
            alert('メールアドレスまたはパスワードが間違っています')
            return
          }

        } catch(err){
          console.log('通信エラー',err)
          alert('通信エラー')
        }
    };
    
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
        <p className='reset-password'>
          パスワードのリセットはこちら:&nbsp;
          <a href='/ResetRequest' className='resetPassword-link'>パスワードのリセット</a>
        </p>
      </form>
    </div>
   );
}

export default Login