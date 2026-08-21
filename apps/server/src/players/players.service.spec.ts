import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from './players.service';
import { DATABASE_CONNECTION } from '../database/database.module';
import { getTestDb, resetTestDb } from '../../test/test-db';

describe('PlayersService', () => {
    let service: PlayersService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayersService, { provide: DATABASE_CONNECTION, useValue: getTestDb() }],
        }).compile();
        service = module.get(PlayersService);
    });

    afterEach(async () => {
        await resetTestDb();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
