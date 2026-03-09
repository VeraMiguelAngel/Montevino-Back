import { Injectable } from '@nestjs/common';
import { ManagementClient } from 'auth0';

@Injectable()
export class Auth0Config {
  public management: ManagementClient;

  constructor() {
    this.management = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN!,
      clientId: process.env.AUTH0_M2M_CLIENT_ID!,
      clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET!,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
    });
  }
}
