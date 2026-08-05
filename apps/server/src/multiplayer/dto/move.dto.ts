import { createZodDto } from 'nestjs-zod';
import { MoveSchema } from '@bchess/shared';

export class MoveDto extends createZodDto(MoveSchema) {}
