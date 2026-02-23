import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    User as FirebaseUser,
    getIdTokenResult
} from 'firebase/auth'
import { auth } from './firebaseConfig'
import { IAuthService } from '../../domain/services/IAuthService'
import { UserProfile } from '../../domain/entities/User'

export class FirebaseAuthService implements IAuthService {
    private currentUser: UserProfile | null = null

    async login(email: string, password: string): Promise<UserProfile> {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const firebaseUser = userCredential.user
        // Force refresh token to get latest custom claims
        await firebaseUser.getIdToken(true)
        this.currentUser = await this.mapFirebaseUser(firebaseUser)
        return this.currentUser
    }

    async logout(): Promise<void> {
        await signOut(auth)
        this.currentUser = null
    }

    onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
        return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Force refresh token to get latest custom claims
                try {
                    await firebaseUser.getIdToken(true)
                } catch (error) {
                    console.warn('Error refreshing token:', error)
                }
                this.currentUser = await this.mapFirebaseUser(firebaseUser)
            } else {
                this.currentUser = null
            }
            callback(this.currentUser)
        })
    }

    getCurrentUser(): UserProfile | null {
        return this.currentUser
    }

    private async mapFirebaseUser(firebaseUser: FirebaseUser): Promise<UserProfile> {
        // Get custom claims from ID token
        let role: string | undefined
        try {
            const tokenResult = await getIdTokenResult(firebaseUser, true) // Force refresh
            role = tokenResult.claims.role as string | undefined
        } catch (error) {
            console.warn('Error getting custom claims:', error)
        }

        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            profilePicture: firebaseUser.photoURL || undefined,
            role,
        }
    }

    async refreshUserToken(): Promise<void> {
        const user = auth.currentUser
        if (user) {
            await user.getIdToken(true) // Force refresh
        }
    }
}
