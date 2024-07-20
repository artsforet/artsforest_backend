import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; "><h1> CAN ARTS FOREST API </h1></div>';
  }
}
