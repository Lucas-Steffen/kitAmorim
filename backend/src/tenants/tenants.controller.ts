import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateInviteDto } from './dto/create.invite.dto';
import { ValidateInviteDto } from './dto/validate.invite.dto';
import { ActivateInviteDto } from './dto/activate.invite.dto';
import { Public } from 'src/auth/decorators/is.public.decorator';
import { AppAbility, CheckPolicies } from 'src/auth/decorators/check.policies.decorator';
import { Action } from 'src/auth/casl/enums/casl.action';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Post('invite')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'tenants'))
  @ApiBody({ type: CreateInviteDto })
  async createInvite(@Body() dto: CreateInviteDto) {
    return this.tenantsService.createInvite(dto);
  }

  @Post('invite/validate')
  @Public()
  @ApiBody({ type: ValidateInviteDto })
  async validateInvite(@Body() dto: ValidateInviteDto) {
    return this.tenantsService.validateInvite(dto.code);
  }

  @Post('invite/activate')
  @Public()
  @ApiBody({ type: ActivateInviteDto })
  async activateInvite(@Body() dto: ActivateInviteDto) {
    return this.tenantsService.activateInvite(dto);
  }
}
