// src/modules/auth/application/use-cases/logout.use-case.ts
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
            // Basic validation
            if (!refreshToken) {
                return Result.fail('Refresh token is required');
            }

            // Verify JWT token structure and expiration
            const payload = JwtService.verifyToken(refreshToken);
            if (!payload || !payload.deviceId) {
                return Result.fail('Invalid refresh token');
            }

            // Check if token exists and is valid in database
            const tokenDoc = await this.tokenQueryRepository.findValidToken(refreshToken, 'REFRESH');
            if (!tokenDoc) {
                return Result.fail('Invalid refresh token');
            }

            // Check if token has expired
            if (new Date() > tokenDoc.expiresAt) {
                return Result.fail('Token expired');
            }

            // Invalidate the token
            await this.tokenCommandRepository.invalidateToken(refreshToken);

            // Deactivate the device session
            await this.deviceCommandRepository.deactivateDevice(payload.deviceId);

            return Result.ok();
        } catch (error) {
            console.error('Logout error:', error);
            return Result.fail('Invalid refresh token');
        }
    }
}