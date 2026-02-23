import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

let adminApp: App

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
    // Option 1: Use service account from environment variable (JSON string)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            adminApp = initializeApp({
                credential: cert(serviceAccount),
            })
        } catch (error) {
            console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error)
            throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT format')
        }
    }
    // Option 2: Use individual environment variables
    else if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.FIREBASE_CLIENT_EMAIL
    ) {
        adminApp = initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
        })
    }
    // Option 3: Use default credentials (for Firebase Functions or GCP)
    else {
        try {
            adminApp = initializeApp()
        } catch (error) {
            console.error('Firebase Admin initialization error:', error)
            throw new Error(
                'Firebase Admin SDK initialization failed. Please provide FIREBASE_SERVICE_ACCOUNT or individual credentials.'
            )
        }
    }
} else {
    adminApp = getApps()[0]
}

export const adminAuth = getAuth(adminApp)
export default adminApp

