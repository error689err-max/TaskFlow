import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UnauthorizedException,
    UploadedFile,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { JwtCookieAuthGuard, type AuthRequest } from '../../../common/guards';
import { AvatarUploadInterceptor } from '../../../common/interceptors';
import { avatarFileValidationPipe } from '../../../common/pipes';
import {
    ChangePasswordDto,
    LoginDto,
    RegisterDto,
    UpdateProfileDto,
} from '../dto/auth.dto';
import { AUTH_MESSAGES } from '../../../common/messages/auth.messages';
import { AuthService } from '../services/auth.service';
import config from '../../../config/env.config';
import { ProviderGuard } from '../guards/provider.guard';
import { AuthBusinessValidator } from '../validators/auth-business.validator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly authBusinessValidator: AuthBusinessValidator,
    ) {}

    private getCookieOptions(maxAge?: number) {
        const isProd = config.NODE_ENV === 'production';

        return {
            httpOnly: true,
            sameSite: isProd ? ('none' as const) : ('lax' as const),
            secure: isProd,
            path: '/',
            ...(maxAge ? { maxAge } : {}),
        };
    }

    @Post('register')
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const { user, accessToken, refreshToken } =
            await this.authService.register(dto);
        this.setAuthCookies(response, accessToken, refreshToken);

        return {
            success: true,
            message: AUTH_MESSAGES.success.userRegistered,
            data: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }
    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const { user, accessToken, refreshToken } =
            await this.authService.login(dto);
        this.setAuthCookies(response, accessToken, refreshToken);
        return {
            success: true,
            message: AUTH_MESSAGES.success.loginSuccessful,
            data: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }
    @Post('logout')
    @UseGuards(JwtCookieAuthGuard)
    async logout(
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.authService.revokeRefreshToken(request.user.id);
        response.clearCookie('access_token', this.getCookieOptions());
        response.clearCookie('refresh_token', this.getCookieOptions());
        return {
            success: true,
            message: AUTH_MESSAGES.success.logoutSuccessful,
            data: null,
        };
    }
    @Post('refresh')
    async refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        const refreshToken = request.cookies?.refresh_token as
            | string
            | undefined;
        if (!refreshToken) {
            throw new UnauthorizedException(
                AUTH_MESSAGES.errors.refreshTokenRequired,
            );
        }
        const {
            user,
            accessToken,
            refreshToken: newRefreshToken,
        } = await this.authService.refresh(refreshToken);
        this.setAuthCookies(response, accessToken, newRefreshToken);
        return {
            success: true,
            message: AUTH_MESSAGES.success.tokenRefreshed,
            data: user,
        };
    }
    @Get('profile')
    @UseGuards(JwtCookieAuthGuard)
    async getProfile(@Req() request: AuthRequest) {
        const user = await this.authService.getProfile(request.user.id);
        return {
            success: true,
            message: AUTH_MESSAGES.success.profileRetrieved,
            data: user,
        };
    }
    @Get('me/role')
    @UseGuards(JwtCookieAuthGuard)
    async getCurrentUserRole(
        @Req() request: AuthRequest,
        @Query('projectId') projectId?: string,
    ) {
        if (!projectId) {
            throw new BadRequestException(
                AUTH_MESSAGES.errors.projectIdRequired,
            );
        }
        const role = await this.authService.getCurrentUserRole(
            request.user.id,
            projectId,
        );
        return {
            success: true,
            message: AUTH_MESSAGES.success.currentUserRoleRetrieved,
            data: role,
        };
    }
    @Patch('profile')
    @UseGuards(JwtCookieAuthGuard)
    async updateProfile(
        @Req() request: AuthRequest,
        @Body() dto: UpdateProfileDto,
    ) {
        const user = await this.authService.updateProfile(request.user.id, dto);
        return {
            success: true,
            message: AUTH_MESSAGES.success.profileUpdated,
            data: user,
        };
    }

    @Patch('profile/avatar')
    @UseGuards(JwtCookieAuthGuard)
    @UseInterceptors(AvatarUploadInterceptor)
    async uploadAvatar(
        @Req() request: AuthRequest,
        @UploadedFile(avatarFileValidationPipe)
        file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException(AUTH_MESSAGES.errors.avatarRequired);
        }

        const user = await this.authService.uploadAvatar(request.user.id, file);

        return {
            success: true,
            message: AUTH_MESSAGES.success.avatarUploaded,
            data: user,
        };
    }

    @Delete('profile/avatar')
    @UseGuards(JwtCookieAuthGuard)
    async removeAvatar(@Req() request: AuthRequest) {
        const user = await this.authService.removeAvatar(request.user.id);

        return {
            success: true,
            message: AUTH_MESSAGES.success.avatarRemoved,
            data: user,
        };
    }

    @Patch('change-password')
    @UseGuards(JwtCookieAuthGuard)
    async changePassword(
        @Req() request: AuthRequest,
        @Body() dto: ChangePasswordDto,
    ) {
        await this.authService.changePassword(request.user.id, dto);
        return {
            success: true,
            message: AUTH_MESSAGES.success.passwordChanged,
            data: null,
        };
    }

    @Get(':provider')
    @UseGuards(ProviderGuard)
    async oauthStart(
        @Param('provider') provider: string,
        @Res() response: Response,
    ) {
        const oauthState = randomBytes(32).toString('hex');
        response.cookie('oauth_state', oauthState, {
            httpOnly: true,
            sameSite: 'lax',
            secure: config.NODE_ENV === 'production',
            path: '/',
            maxAge: 10 * 60 * 1000,
        });

        const redirectUrl = this.authService.initiateOAuth(
            provider,
            oauthState,
        );
        return response.redirect(redirectUrl);
    }

    @Get(':provider/callback')
    @UseGuards(ProviderGuard)
    async oauthCallback(
        @Param('provider') provider: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const stateQueryParam = request.query.state;
        const stateFromProvider =
            typeof stateQueryParam === 'string' ? stateQueryParam : undefined;
        const stateFromCookie = request.cookies?.oauth_state as
            | string
            | undefined;

        this.authBusinessValidator.validateOAuthState({
            stateFromProvider,
            stateFromCookie,
        });

        const result = await this.authService.handleOAuthCallback(
            provider,
            request,
        );
        response.clearCookie('oauth_state', this.getCookieOptions());
        this.setAuthCookies(response, result.accessToken, result.refreshToken);
        return response.redirect(`${config.FRONTEND_URL}/dashboard`);
    }

    private setAuthCookies(
        response: Response,
        accessToken: string,
        refreshToken: string,
    ): void {
        response.cookie(
            'access_token',
            accessToken,
            this.getCookieOptions(
                this.parseDurationToMs(config.ACCESS_TOKEN_EXPIRES_IN),
            ),
        );
        response.cookie(
            'refresh_token',
            refreshToken,
            this.getCookieOptions(
                this.parseDurationToMs(config.REFRESH_TOKEN_EXPIRES_IN),
            ),
        );
    }
    private parseDurationToMs(duration: string): number {
        const normalized = duration.trim();
        const match = normalized.match(/^(\d+)([smhd])$/i);
        if (!match) {
            const asNumber = Number(normalized);
            if (!Number.isNaN(asNumber) && asNumber > 0) {
                return asNumber * 1000;
            }
            return 15 * 60 * 1000;
        }
        const value = Number(match[1]);
        const unit = match[2].toLowerCase();
        switch (unit) {
            case 's':
                return value * 1000;
            case 'm':
                return value * 60 * 1000;
            case 'h':
                return value * 60 * 60 * 1000;
            case 'd':
                return value * 24 * 60 * 60 * 1000;
            default:
                return 15 * 60 * 1000;
        }
    }
}
