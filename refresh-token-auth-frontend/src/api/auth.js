const BASE = ''  // Vite proxy → http://localhost:9096

async function request(path, options = {}) {
    const res = await fetch(BASE + path, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    })
    return res
}

export async function register(fullName, email, password) {
    const res = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password }),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Kayıt başarısız (${res.status})`)
    }
}

export async function login(email, password) {
    // ⚠ Backend Email & Password fields are capitalized
    const res = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Giriş başarısız (${res.status})`)
    }
    return res.json()
}

export async function refreshToken() {
    const res = await request('/api/auth/refresh', { method: 'POST' })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Refresh başarısız (${res.status})`)
    }
    return res.json()
}

export async function logout() {
    await request('/api/auth/logout', { method: 'POST' })
}
