import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (token) fetchCurrentUser(token)
    }, [])

    const fetchCurrentUser = async (token) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/users/current-user/', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setUser(data)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const login = async (username, password) => {
        const response = await fetch('http://127.0.0.1:8000/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
        const data = await response.json()
        if (response.ok) {
            localStorage.setItem('access_token', data.access)
            localStorage.setItem('refresh_token', data.refresh)
            await fetchCurrentUser(data.access)
            return true
        }
        return false
    }

    const logout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)