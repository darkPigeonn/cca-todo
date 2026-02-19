import { UserProfile } from '../entities/User'

export interface IUserRepository {
    getUserByUid(uid: string): Promise<UserProfile | null>
    createUserProfile(profile: UserProfile): Promise<void>
    updateUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void>
    getUnlinkedEmployees(): Promise<UserProfile[]>
    linkUserToEmployee(uid: string, employeeId: string): Promise<void>
}
