import { Injectable } from '@nestjs/common';
import { CreateMultiplayerDto } from './dto/create-multiplayer.dto';
import { UpdateMultiplayerDto } from './dto/update-multiplayer.dto';

@Injectable()
export class MultiplayerService {
  create(createMultiplayerDto: CreateMultiplayerDto) {
    return 'This action adds a new multiplayer';
  }

  findAll() {
    return `This action returns all multiplayer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} multiplayer`;
  }

  update(id: number, updateMultiplayerDto: UpdateMultiplayerDto) {
    return `This action updates a #${id} multiplayer`;
  }

  remove(id: number) {
    return `This action removes a #${id} multiplayer`;
  }
}
