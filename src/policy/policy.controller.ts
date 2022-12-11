import { PolicyRequest } from '../policy-request.interface';
import { PolicyService } from './policy.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('policy')
export class PolicyController {
  constructor(private policyService: PolicyService) {}

  @Post('keys')
  async getKeys(@Body() request: PolicyRequest): Promise<string[]> {
    const obj = await this.policyService.ExecuteOPA(request);
    return Object.keys(obj);
  }
}
