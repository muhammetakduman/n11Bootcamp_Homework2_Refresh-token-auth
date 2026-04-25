import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as apiRegister } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
    const { addLog } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ fullName: '', email: '', password: '' })
    const [status, setStatus] = useState(null) // { type, msg }
    const [loading, setLoading] = useState(false)

    function set(field) {
        return e => setForm(f => ({ ...f, [field]: e.target.value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setStatus(null)
        setLoading(true)
        addLog(`POST /api/auth/register → {fullName, email: "${form.email}"}`, 'info')
        try {
            await apiRegister(form.fullName, form.email, form.password)
            addLog('← 200 OK — kayıt başarılı, giriş sayfasına yönlendiriliyor', 'success')
            setStatus({ type: 'success', msg: 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...' })
            setTimeout(() => navigate('/login'), 1500)
        } catch (err) {
            setStatus({ type: 'error', msg: err.message })
            addLog(`← HATA: ${err.message}`, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Kayıt Ol</h1>
                    <p>Yeni hesap oluştur</p>
                </div>

                {status && (
                    <div className={`alert alert-${status.type}`}>{status.msg}</div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Ad Soyad</label>
                        <input type="text" value={form.fullName} onChange={set('fullName')}
                            placeholder="Muhammet Akduman" required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={form.email} onChange={set('email')}
                            placeholder="test@test.com" required />
                    </div>
                    <div className="form-group">
                        <label>Şifre</label>
                        <input type="password" value={form.password} onChange={set('password')}
                            placeholder="••••••" minLength={6} required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Zaten hesabın var mı?</span>
                    <Link to="/login">Giriş Yap</Link>
                </div>

                <div className="api-note">
                    <div className="api-note-title">API</div>
                    <code>POST /api/auth/register</code>
                    <div className="api-note-body">
                        {'{ "fullName": "...", "email": "...", "password": "..." }'}
                    </div>
                    <div className="api-note-response">Response: 200 OK (body yok)</div>
                </div>
            </div>
        </div>
    )
}
