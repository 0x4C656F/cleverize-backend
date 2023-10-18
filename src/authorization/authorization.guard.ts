import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { expressJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { promisify } from 'util';

var { expressjwt: jwt } = require('express-jwt');
@Injectable()
export class AuthorizationGuard implements CanActivate {
  private AUTH0_DOMAIN: string;
  private AUTH0_AUDIENCE: string;
  constructor(private configServise: ConfigService) {
    this.AUTH0_AUDIENCE = this.configServise.get('AUTH0_AUDIENCE');
    this.AUTH0_DOMAIN = this.configServise.get('AUTH0_DOMAIN');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.getArgByIndex(0);
    const res = context.getArgByIndex(1);
    const checkJwt = promisify(
      jwt({
        secret: expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `${this.AUTH0_DOMAIN}.well-known/jwks.json`,
        }),
        audience: this.AUTH0_AUDIENCE,
        issuer: this.AUTH0_DOMAIN,
        algorithms: ['RS256'],
      }),
    );

    try {
      await checkJwt(req, res);
      return true;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
