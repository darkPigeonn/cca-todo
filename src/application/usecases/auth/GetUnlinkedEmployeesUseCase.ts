import { IUserRepository } from '../../../domain/repositories/IUserRepository'
import { UserProfile } from '../../../domain/entities/User'

export class GetUnlinkedEmployeesUseCase {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(): Promise<UserProfile[]> {
        return this.userRepository.getUnlinkedEmployees()
    }
}
