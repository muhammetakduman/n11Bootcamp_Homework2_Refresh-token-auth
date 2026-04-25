import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as apiLogin } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const { login, addLog } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        addLog(`POST /api/auth/login → {Email: "${email}", Password: "***"}`, 'info')
        try {
            const data = await apiLogin(email, password)
            addLog(`← 200 OK — accessToken (body) + refreshToken (HttpOnly Cookie) alındı`, 'success')
            login(data.accessToken)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
            addLog(`← HATA: ${err.message}`, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Giriş Yap</h1>
                    <p>Refresh Token Auth Demo</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="test@test.com" required />
                    </div>
                    <div className="form-group">
                        <label>Şifre</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••" required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Hesabın yok mu?</span>
                    <Link to="/register">Kayıt Ol</Link>
                </div>

                <div className="api-note">
                    <div className="api-note-title">API</div>
                    <code>POST /api/auth/login</code>
                    <div className="api-note-body">
                        {'{ "Email": "...", "Password": "..." }'}
                    </div>
                    <div className="api-note-warn">⚠ Alan adları büyük harfle: Email, Password</div>
                    <div className="api-note-response">Response: accessToken (body) + refreshToken (Cookie)</div>
                </div>
            </div>
        </div>
    )
}
