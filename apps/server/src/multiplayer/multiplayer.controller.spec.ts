import { Test, TestingModule } from '@nestjs/testing';
import { MultiplayerController } from './multiplayer.controller';

describe('MultiplayerController', () => {
  let controller: MultiplayerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MultiplayerController],
    }).compile();

    controller = module.get<MultiplayerController>(MultiplayerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
