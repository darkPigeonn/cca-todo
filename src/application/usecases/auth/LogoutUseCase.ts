import { IAuthService } from '../../../domain/services/IAuthService'

export class LogoutUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(): Promise<void> {
    return this.authService.logout()
  }
}
