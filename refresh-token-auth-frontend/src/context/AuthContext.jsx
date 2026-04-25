import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { refreshToken as apiRefresh, logout as apiLogout } from '../api/auth'

const AuthContext = createContext(null)

export function decodeJwtExpiry(token) {
    try {
        const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(atob(b64))
        return payload.exp * 1000 // ms
    } catch {
        return null
    }
}

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'))
    const [logs, setLogs] = useState([])
    const refreshTimerRef = useRef(null)
    const accessTokenRef = useRef(accessToken)

    useEffect(() => { accessTokenRef.current = accessToken }, [accessToken])

    const addLog = useCallback((msg, type = 'info') => {
        const entry = { id: Date.now() + Math.random(), msg, type, time: new Date().toLocaleTimeString() }
        setLogs(prev => [...prev.slice(-49), entry])
    }, [])

    const saveToken = useCallback((token) => {
        localStorage.setItem('accessToken', token)
        setAccessToken(token)
        accessTokenRef.current = token
    }, [])

    const clearToken = useCallback(() => {
        localStorage.removeItem('accessToken')
        setAccessToken(null)
        accessTokenRef.current = null
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }, [])

    const scheduleRefresh = useCallback((token) => {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
        const expiry = decodeJwtExpiry(token)
        if (!expiry) return
        const delay = Math.max(expiry - Date.now() - 10_000, 3_000) // 10 s before expiry
        addLog(`Otomatik yenileme ${Math.round(delay / 1000)}s sonra planlandı`, 'info')
        refreshTimerRef.current = setTimeout(async () => {
            addLog('Access token süresi doluyor — otomatik yenileniyor...', 'warn')
            try {
                const data = await apiRefresh()
                saveToken(data.accessToken)
                addLog('Token otomatik yenilendi ✓', 'success')
                scheduleRefresh(data.accessToken)
            } catch (err) {
                addLog(`Otomatik yenileme başarısız: ${err.message}`, 'error')
                clearToken()
            }
        }, delay)
    }, [addLog, saveToken, clearToken]) // eslint-disable-line react-hooks/exhaustive-deps

    // Schedule on mount if a token already exists (page reload)
    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        if (token) scheduleRefresh(token)
        return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current) }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const login = useCallback((token) => {
        saveToken(token)
        scheduleRefresh(token)
        addLog('Giriş başarılı — access token localStorage\'a kaydedildi', 'success')
        addLog('Refresh token → HttpOnly Cookie olarak set edildi (JS göremez)', 'info')
    }, [saveToken, scheduleRefresh, addLog])

    const doLogout = useCallback(async () => {
        try {
            await apiLogout()
            addLog('POST /api/auth/logout → 200 OK (cookie temizlendi)', 'info')
        } catch {
            addLog('Logout isteği başarısız (devam ediliyor)', 'warn')
        }
        clearToken()
        addLog('localStorage\'dan access token silindi', 'info')
    }, [clearToken, addLog])

    // Wraps any protected fetch: handles 401/403 → refresh → retry
    const authFetch = useCallback(async (url, options = {}) => {
        const token = accessTokenRef.current
        addLog(`→ ${options.method || 'GET'} ${url}`, 'info')
        const res = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: { ...options.headers, Authorization: `Bearer ${token}` },
        })
        if (res.status === 401 || res.status === 403) {
            addLog(`← ${res.status} alındı — token yenileme deneniyor...`, 'warn')
            try {
                const data = await apiRefresh()
                saveToken(data.accessToken)
                scheduleRefresh(data.accessToken)
                addLog('Token yenilendi — istek tekrar gönderiliyor', 'success')
                const retry = await fetch(url, {
                    ...options,
                    credentials: 'include',
                    headers: { ...options.headers, Authorization: `Bearer ${data.accessToken}` },
                })
                addLog(`← ${retry.status} (yeniden gönderim sonrası)`, retry.ok ? 'success' : 'error')
                return retry
            } catch (err) {
                addLog(`Refresh başarısız: ${err.message} — oturum sonlandırıldı`, 'error')
                clearToken()
                throw err
            }
        }
        addLog(`← ${res.status} ${res.ok ? 'OK' : 'HATA'}`, res.ok ? 'success' : 'error')
        return res
    }, [addLog, saveToken, scheduleRefresh, clearToken])

    const tokenExpiry = accessToken ? decodeJwtExpiry(accessToken) : null

    return (
        <AuthContext.Provider value={{ accessToken, tokenExpiry, login, logout: doLogout, authFetch, logs, addLog }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
