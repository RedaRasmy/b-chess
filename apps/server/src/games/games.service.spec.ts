import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { getTestDbProvider, resetTestDb } from '../../test/test-db';

describe('GamesService', () => {
    let service: GamesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GamesService, getTestDbProvider()],
        }).compile();

        service = module.get<GamesService>(GamesService);
    });

    afterEach(async () => {
        await resetTestDb();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
