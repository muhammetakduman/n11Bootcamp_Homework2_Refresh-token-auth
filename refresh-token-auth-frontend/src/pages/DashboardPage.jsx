import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TokenPanel from '../components/TokenPanel'
import ActivityLog from '../components/ActivityLog'

const FLOW_STEPS = [
    { label: 'Register', sub: 'POST /api/auth/register' },
    { label: 'Login', sub: 'accessToken + Cookie' },
    { label: 'API İsteği', sub: 'Bearer token' },
    { label: '401/403?', sub: 'Token refresh' },
    { label: 'Retry', sub: 'Yeni token ile' },
]

export default function DashboardPage() {
    const { login, logout, addLog } = useAuth()
    const navigate = useNavigate()
    const [refreshLoading, setRefreshLoading] = useState(false)

    async function handleLogout() {
        await logout()
        navigate('/login')
    }

    async function manualRefresh() {
        setRefreshLoading(true)
        addLog('Manuel refresh token isteği gönderiliyor...', 'info')
        try {
            const { refreshToken: apiRefresh } = await import('../api/auth')
            const data = await apiRefresh()
            login(data.accessToken)
            addLog('← 200 OK — yeni accessToken alındı', 'success')
        } catch (err) {
            addLog('← Refresh başarısız: ' + err.message, 'error')
        } finally {
            setRefreshLoading(false)
        }
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Refresh Token Auth — Dashboard</h1>
                </div>
                <div className="header-actions">
                    <span className="online-badge">Oturum Açık</span>
                    <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                        Çıkış Yap
                    </button>
                </div>
            </header>

            <div className="dashboard-body">
                <main className="dashboard-main">

                    {/* MANUAL REFRESH TEST */}
                    <div className="card">
                        <h2 className="section-title">Manuel Refresh Token Testi</h2>
                        <p className="section-desc">
                            Refresh token endpoint'ini doğrudan çağır. Cookie otomatik gönderilir,
                            yeni accessToken + yeni Cookie gelir (Token Rotation).
                        </p>
                        <div className="endpoint-row">
                            <span className="method-post">POST</span>
                            <code>/api/auth/refresh</code>
                        </div>
                        <div className="info-box">
                            <strong>credentials: 'include'</strong> zorunlu — aksi halde refreshToken cookie gönderilmez.
                        </div>
                        <div className="btn-row">
                            <button className="btn btn-secondary" onClick={manualRefresh} disabled={refreshLoading}>
                                {refreshLoading ? 'Yenileniyor...' : 'Refresh Token Yenile'}
                            </button>
                        </div>
                    </div>

                    {/* FLOW DIAGRAM */}
                    <div className="card">
                        <h2 className="section-title">Frontend Akış Diyagramı</h2>
                        <div className="flow-diagram">
                            {FLOW_STEPS.map((step, i) => (
                                <div key={i} className="flow-wrap">
                                    <div className={`flow-step ${i === 2 ? 'flow-active' : i < 2 ? 'flow-done' : ''}`}>
                                        <div className="flow-step-num">{i + 1}</div>
                                        <div className="flow-label">{step.label}</div>
                                        <div className="flow-sub">{step.sub}</div>
                                    </div>
                                    {i < FLOW_STEPS.length - 1 && <div className="flow-arrow">›</div>}
                                </div>
                            ))}
                        </div>
                        <div className="flow-legend">
                            <span className="fl-done">Tamamlandı</span>
                            <span className="fl-active">Şu an burada</span>
                            <span className="fl-todo">Gerektiğinde</span>
                        </div>
                    </div>

                </main>

                <aside className="dashboard-sidebar">
                    <TokenPanel />
                    <ActivityLog />
                </aside>
            </div>
        </div>
    )
}
