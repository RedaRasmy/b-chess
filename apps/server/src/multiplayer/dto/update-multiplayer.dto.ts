import { PartialType } from '@nestjs/mapped-types';
import { CreateMultiplayerDto } from './create-multiplayer.dto';

export class UpdateMultiplayerDto extends PartialType(CreateMultiplayerDto) {
  id: number;
}
