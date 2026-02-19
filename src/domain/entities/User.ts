export interface UserProfile {
    id?: string
    uid: string
    email: string
    name: string
    role?: string
    profilePicture?: string
    isLinked?: boolean
    // Add other employee-specific fields here
}
