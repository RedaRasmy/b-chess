import { Test, TestingModule } from '@nestjs/testing';
import { ResignService } from './resign.service';

describe('ResignService', () => {
    let service: ResignService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ResignService],
        }).compile();

        service = module.get<ResignService>(ResignService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
