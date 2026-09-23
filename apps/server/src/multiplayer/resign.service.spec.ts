import { Test, TestingModule } from '@nestjs/testing';
import { ResignService } from './resign.service';
import { getTestDbProvider, resetTestDb } from '../../test/test-db';
import { GamesService } from '../games/games.service';
import { PlayersService } from '../players/players.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ResignService', () => {
    let service: ResignService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ResignService,
                GamesService,
                PlayersService,
                EventEmitter2,
                getTestDbProvider(),
            ],
        }).compile();

        service = module.get<ResignService>(ResignService);
    });

    afterEach(async () => {
        await resetTestDb();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
