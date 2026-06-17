import { ApiProperty } from '@nestjs/swagger';

export class JoinChallengeDto {
  @ApiProperty({ description: 'UUID de l\'utilisateur qui rejoint le challenge' })
  user_id: string;
}
