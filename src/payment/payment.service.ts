import { Injectable } from '@nestjs/common';
import { User } from '../auth/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(
    private readonly userService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
) {}

  async processBankTransfer(user: User, bankAccountNumber: string): Promise<{ success: boolean, message?: string }> {
    const amount = 100000; 

    const exampleBankAccountNumber = '11-1111-1111'; 

    if (bankAccountNumber === exampleBankAccountNumber) {
      console.log(`Transfer to KB Kookmin Bank account ${bankAccountNumber} for user ${user.username} with amount ${amount} was successful.`);

      user.hasSubscription = true;
      await this.userRepository.save(user);
      return { success: true, message: 'Payment successful, subscription granted for 30 days' };
    } else {
      console.log(`Transfer failed: invalid bank account number ${bankAccountNumber}.`);
      return { success: false, message: 'Invalid bank account number' };
    }
  }
}
