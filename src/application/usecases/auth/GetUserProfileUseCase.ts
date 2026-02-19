import { IUserRepository } from '../../../domain/repositories/IUserRepository'
import { UserProfile } from '../../../domain/entities/User'

export class GetUserProfileUseCase {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(uid: string): Promise<UserProfile | null> {
        return this.userRepository.getUserByUid(uid)
    }
}
