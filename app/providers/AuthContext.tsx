'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserProfile } from '../../src/domain/entities/User'
import { FirebaseAuthService } from '../../src/infrastructure/auth/FirebaseAuthService'
import { LoginUseCase } from '../../src/application/usecases/auth/LoginUseCase'
import { LogoutUseCase } from '../../src/application/usecases/auth/LogoutUseCase'

interface AuthContextType {
    user: UserProfile | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Initialize infrastructure services
const authService = new FirebaseAuthService()

// Initialize use cases
const loginUseCase = new LoginUseCase(authService)
const logoutUseCase = new LogoutUseCase(authService)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch additional profile data from API (which runs on server)
                try {
                    const res = await fetch(`/api/profile?uid=${firebaseUser.uid}`)
                    if (res.ok) {
                        const profile = await res.json()
                        if (profile) {
                            setUser({ ...firebaseUser, ...profile, isLinked: true })
                        } else {
                            setUser({ ...firebaseUser, isLinked: false })
                        }
                    } else {
                        setUser({ ...firebaseUser, isLinked: false })
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error)
                    setUser(firebaseUser)
                }
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const login = async (email: string, password: string) => {
        await loginUseCase.execute(email, password)
    }

    const logout = async () => {
        await logoutUseCase.execute()
    }

    const refreshProfile = async () => {
        if (user?.uid) {
            setLoading(true)
            try {
                const res = await fetch(`/api/profile?uid=${user.uid}`)
                if (res.ok) {
                    const profile = await res.json()
                    if (profile) {
                        setUser({ ...user, ...profile, isLinked: true })
                    }
                }
            } catch (error) {
                console.error('Error refreshing profile:', error)
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
