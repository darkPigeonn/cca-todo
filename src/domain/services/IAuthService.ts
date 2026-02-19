import { UserProfile } from '../entities/User'

export interface IAuthService {
    login(email: string, password: string): Promise<UserProfile>
    logout(): Promise<void>
    onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void
    getCurrentUser(): UserProfile | null
}
