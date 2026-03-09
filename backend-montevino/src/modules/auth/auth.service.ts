import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth0Config } from 'src/config/auth0.config';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthService {
  constructor(
    private readonly auth0Config: Auth0Config,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: CreateUserDto) {
    try {
      const auth0Res = await this.auth0Config.management.users.create({
        email: dto.email,
        password: dto.password,
        connection: 'Username-Password-Authentication',
        name: dto.name,
      });

      return await this.usersService.create({
        ...dto,
        auth0Id: auth0Res.user_id,
      } as any);
    } catch (error: any) {
      if (error.statusCode === 409) {
        throw new ConflictException(
          'El correo ya está registrado en Montevino.',
        );
      }

      if (error.statusCode === 400) {
        throw new BadRequestException(
          'Datos inválidos: verifica el formato del email o la longitud de la contraseña.',
        );
      }

      throw new InternalServerErrorException(
        'Error al procesar el registro en el servidor de autenticación.',
      );
    }
  }

  async login(email: string, password: string) {
    const url = `https://${process.env.AUTH0_DOMAIN}/oauth/token`;

    try {
      const response = await axios.post(url, {
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        username: email,
        password: password,
        audience: process.env.AUTH0_AUDIENCE,
        scope: 'openid profile email',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
        realm: 'Username-Password-Authentication',
      });

      return response.data;
    } catch (error: any) {
      throw new UnauthorizedException(
        error.response?.data?.error_description || 'Credenciales inválidas',
      );
    }
  }

  getGoogleAuthUrl() {
    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const redirectUri = process.env.AUTH0_CALLBACK_URL;

    return (
      `https://${domain}/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=openid%20profile%20email&` +
      `connection=google-oauth2`
    );
  }

  async handleGoogleCallback(code: string) {
    const url = `https://${process.env.AUTH0_DOMAIN}/oauth/token`;

    try {
      const response = await axios.post(url, {
        grant_type: 'authorization_code',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.AUTH0_CALLBACK_URL,
      });

      const { id_token, access_token } = response.data;
      const decoded: any = jwt.decode(id_token);

      const user = await this.usersService.create({
        auth0Id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
      } as any);

      return {
        access_token,
        user,
      };
    } catch (error) {
      console.error('Error en el callback de Google:', error.response?.data);
      throw error;
    }
  }
}
