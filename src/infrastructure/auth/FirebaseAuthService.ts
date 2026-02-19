import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth'
import { auth } from './firebaseConfig'
import { IAuthService } from '../../domain/services/IAuthService'
import { UserProfile } from '../../domain/entities/User'

export class FirebaseAuthService implements IAuthService {
    private currentUser: UserProfile | null = null

    async login(email: string, password: string): Promise<UserProfile> {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const firebaseUser = userCredential.user
        this.currentUser = this.mapFirebaseUser(firebaseUser)
        return this.currentUser
    }

    async logout(): Promise<void> {
        await signOut(auth)
        this.currentUser = null
    }

    onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
        return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
            this.currentUser = firebaseUser ? this.mapFirebaseUser(firebaseUser) : null
            callback(this.currentUser)
        })
    }

    getCurrentUser(): UserProfile | null {
        return this.currentUser
    }

    private mapFirebaseUser(firebaseUser: FirebaseUser): UserProfile {
        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            profilePicture: firebaseUser.photoURL || undefined,
        }
    }
}
