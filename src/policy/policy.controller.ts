import { PolicyRequest } from '../policy-request.interface';
import { PolicyService } from './policy.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('policy')
export class PolicyController {
  constructor(private policyService: PolicyService) {}

  @Post('keys')
  async getKeys(@Body() request: PolicyRequest): Promise<string[]> {
    const obj = await this.policyService.GetKeys(request);
    return Object.keys(obj);
  }

  @Post('conftest')
  async getConfTest(@Body() request: PolicyRequest): Promise<string> {
    try {
      return await this.policyService.GetConfTest(request);
    } catch (e) {
      return e;
    }
  }
}
