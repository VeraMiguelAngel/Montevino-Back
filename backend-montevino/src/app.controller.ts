import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): object {
    return {
      message: 'Montevino API online',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
