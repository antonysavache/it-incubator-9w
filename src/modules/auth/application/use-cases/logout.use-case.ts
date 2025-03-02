import { Result } from "../../../../shared/infrastructures/result";
import { TokenCommandRepository } from "../../infrastructure/repositories/token-command.repository";
import { TokenQueryRepository } from "../../infrastructure/repositories/token-query.repository";
import { JwtService } from "../../../../shared/services/jwt.service";
import { DeviceCommandRepository } from "../../infrastructure/repositories/device-command.repository";

export class LogoutUseCase {
    constructor(
        private tokenCommandRepository: TokenCommandRepository,
        private tokenQueryRepository: TokenQueryRepository,
        private deviceCommandRepository: DeviceCommandRepository
    ) {}

    async execute(refreshToken: string): Promise<Result<void>> {
        try {
            if (!refreshToken) {
                return Result.fail('Refresh token is required');
            }

            const payload = JwtService.verifyToken(refreshToken);
            if (!payload || !payload.deviceId) {
                return Result.fail('Invalid refresh token');
            }

            const tokenDoc = await this.tokenQueryRepository.findValidToken(refreshToken, 'REFRESH');
            if (!tokenDoc) {
                return Result.fail('Invalid refresh token');
            }

            await this.tokenCommandRepository.invalidateToken(refreshToken);

            await this.deviceCommandRepository.deactivateDevice(payload.deviceId);

            return Result.ok();
        } catch (error) {
            console.error('Logout error:', error);
            return Result.fail('Invalid refresh token');
        }
    }
}