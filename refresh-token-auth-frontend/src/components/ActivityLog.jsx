import { useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const TYPE_COLOR = { info: '#3b82f6', success: '#16a34a', error: '#dc2626', warn: '#d97706' }
const TYPE_ICON = { info: 'ℹ', success: '✓', error: '✗', warn: '⚠' }

export default function ActivityLog() {
    const { logs } = useAuth()
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    return (
        <div className="card activity-log">
            <h3 className="panel-title">Aktivite Logu</h3>
            <div className="log-entries">
                {logs.length === 0 && (
                    <div className="log-empty">Henüz aktivite yok...</div>
                )}
                {logs.map(entry => (
                    <div key={entry.id} className="log-entry">
                        <span className="log-icon" style={{ color: TYPE_COLOR[entry.type] }}>
                            {TYPE_ICON[entry.type]}
                        </span>
                        <span className="log-time">{entry.time}</span>
                        <span className="log-msg">{entry.msg}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    )
}
