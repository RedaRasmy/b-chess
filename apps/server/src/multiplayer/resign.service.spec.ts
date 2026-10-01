import { Test, TestingModule } from '@nestjs/testing';
import { ResignService } from './resign.service.js';
import { getTestDbProvider, resetTestDb } from '../../test/test-db.js';
import { GamesService } from '../games/games.service.js';
import { PlayersService } from '../players/players.service.js';
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
