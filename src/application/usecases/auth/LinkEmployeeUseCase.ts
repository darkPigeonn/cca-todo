import { IUserRepository } from '../../../domain/repositories/IUserRepository'

export class LinkEmployeeUseCase {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(uid: string, employeeId: string): Promise<void> {
        if (!uid || !employeeId) {
            throw new Error('UID and Employee ID are required')
        }
        await this.userRepository.linkUserToEmployee(uid, employeeId)
    }
}
