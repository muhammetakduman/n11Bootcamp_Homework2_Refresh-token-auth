import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function formatMs(ms) {
    if (ms <= 0) return 'DOLDU'
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
}

function truncateToken(t) {
    if (!t) return '—'
    return t.length <= 32 ? t : `${t.slice(0, 20)}...${t.slice(-8)}`
}

export default function TokenPanel() {
    const { accessToken, tokenExpiry } = useAuth()
    const [remaining, setRemaining] = useState(0)

    useEffect(() => {
        if (!tokenExpiry) { setRemaining(0); return }
        const tick = () => setRemaining(tokenExpiry - Date.now())
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [tokenExpiry])

    const MAX_MS = 1 * 60 * 1000 // 1 min access token lifetime
    const pct = accessToken && remaining > 0 ? Math.min(100, (remaining / MAX_MS) * 100) : 0
    const barColor = pct > 40 ? '#22c55e' : pct > 15 ? '#f59e0b' : '#ef4444'
    const status = !accessToken ? 'none' : remaining > 0 ? 'active' : 'expired'

    return (
        <div className="card token-panel">
            <h3 className="panel-title">Token Durumu</h3>

            {/* ACCESS TOKEN */}
            <div className="token-section">
                <div className="token-section-header">
                    <span className="token-section-label">ACCESS TOKEN</span>
                    <span className={`badge badge-${status}`}>
                        {status === 'none' ? 'YOK' : status === 'active' ? 'AKTİF' : 'DOLDU'}
                    </span>
                </div>
                {accessToken ? (
                    <>
                        <div className="token-value">{truncateToken(accessToken)}</div>
                        <div className="token-meta-row">
                            <span>localStorage</span>
                            <span>{formatMs(remaining)}</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }} />
                        </div>
                        {tokenExpiry && (
                            <div className="token-expires">Bitiş: {new Date(tokenExpiry).toLocaleTimeString()}</div>
                        )}
                    </>
                ) : (
                    <div className="token-empty">Henüz token yok — lütfen giriş yap</div>
                )}
            </div>

            {/* REFRESH TOKEN */}
            <div className="token-section">
                <div className="token-section-header">
                    <span className="token-section-label">REFRESH TOKEN</span>
                    <span className="badge badge-cookie">HttpOnly Cookie</span>
                </div>
                <div className="cookie-rows">
                    <div className="cookie-row">JS tarafından okunamaz (güvenli)</div>
                    <div className="cookie-row"><code>credentials: 'include'</code> ile otomatik gönderilir</div>
                    <div className="cookie-row">Ömür: 5 dakika</div>
                    <div className="cookie-row">Token Rotation — her kullanımda yenilenir</div>
                    <div className="cookie-row">Logout'ta DB'den ve Cookie'den silinir</div>
                </div>
            </div>

            {/* STORAGE INFO */}
            <div className="storage-table">
                <div className="storage-row storage-header">
                    <span>Token</span><span>Depolama</span><span>Süre</span>
                </div>
                <div className="storage-row">
                    <span>Access</span><span>localStorage</span><span>1 dk</span>
                </div>
                <div className="storage-row">
                    <span>Refresh</span><span>HttpOnly Cookie</span><span>5 dk</span>
                </div>
            </div>
        </div>
    )
}
