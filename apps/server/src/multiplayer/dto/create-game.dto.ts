import { createZodDto } from 'nestjs-zod';
import { InsertGameSchema } from '@bchess/shared';

export class CreateGameDto extends createZodDto(InsertGameSchema) {}
