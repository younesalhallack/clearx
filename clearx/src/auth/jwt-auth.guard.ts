import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guards routes with the 'jwt' Passport strategy. Applied to every
 * controller/endpoint in the platform except /auth/login and /auth/register.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
