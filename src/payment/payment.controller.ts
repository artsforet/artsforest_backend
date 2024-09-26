import { Controller, Post, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthService } from '../auth/auth.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly userService: AuthService,
  ) {}

  @Post('bank-transfer')
  async processBankTransfer(@Body() { userId, bankAccountNumber }): Promise<string> {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const paymentResult = await this.paymentService.processBankTransfer(user, bankAccountNumber);

    if (paymentResult.success) {
      return paymentResult.message;
    } else {
      throw new BadRequestException(paymentResult.message);
    }
  }
}