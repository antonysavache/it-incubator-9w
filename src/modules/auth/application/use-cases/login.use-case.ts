import bcrypt from 'bcrypt';
import { UsersQueryRepository } from "../../../users/domain/infrastructures/repositories/users-query.repository";
import { Result } from "../../../../shared/infrastructures/result";
import { TokenCommandRepository } from "../../infrastructure/repositories/token-command.repository";
import { SETTINGS } from "../../../../configs/settings";
import { LoginDTO } from "../interfaces/auth.interface";
import { TOKEN_SETTINGS } from "../../domain/interfaces/token.interface";
import {JwtService} from "../../../../shared/services/jwt.service";

export class LoginUseCase {
    constructor(
        private usersQueryRepository: UsersQueryRepository,
        private tokenCommandRepository: TokenCommandRepository
    ) {}

    async execute(dto: LoginDTO): Promise<Result<{ accessToken: string, refreshToken: string }>> {
        const { loginOrEmail, password } = dto;

        const user = await this.usersQueryRepository.findByFilter({
            $or: [
                { login: loginOrEmail },
                { email: loginOrEmail }
            ]
        });

        if (!user) {
            return Result.fail('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return Result.fail('Invalid credentials');
        }

        const accessToken = JwtService.createJWT(
            user._id.toString(),
            TOKEN_SETTINGS.ACCESS_TOKEN_EXPIRATION
        );

        const refreshToken = JwtService.createJWT(
            user._id.toString(),
            TOKEN_SETTINGS.REFRESH_TOKEN_EXPIRATION
        );

        await this.tokenCommandRepository.saveTokens(
            user._id.toString(),
            accessToken,
            refreshToken
        );

        return Result.ok({ accessToken, refreshToken });
    }
}