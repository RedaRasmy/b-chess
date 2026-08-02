import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { GamesService } from './games.service';


@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    // TODO:
    // get full game by id 
    // get current/recent games of top rated players
}
