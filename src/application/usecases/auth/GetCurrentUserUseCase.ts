import { IAuthService } from '../../../domain/services/IAuthService'
import { UserProfile } from '../../../domain/entities/User'

export class GetCurrentUserUseCase {
    constructor(private readonly authService: IAuthService) { }

    execute(): UserProfile | null {
        return this.authService.getCurrentUser()
    }
}
