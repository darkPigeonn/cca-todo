import { IAuthService } from '../../../domain/services/IAuthService'
import { UserProfile } from '../../../domain/entities/User'

export class LoginUseCase {
    constructor(private readonly authService: IAuthService) { }

    async execute(email: string, password: string): Promise<UserProfile> {
        return this.authService.login(email, password)
    }
}
