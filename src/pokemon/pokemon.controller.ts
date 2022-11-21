import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { ParseMoongoIdPipe } from '../common/pipes/parse-moongo-id.pipe';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post()
  //Puedes usar esta notacion para variar codigos http
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPokemonDto: CreatePokemonDto) {
    return this.pokemonService.create(createPokemonDto);
  }

  @Get()
  findAll(@Query() queryParameters: PaginationDto) {
    return this.pokemonService.findAll(queryParameters);
  }

  @Get(':termSearch')
  findOne(@Param('termSearch') termSearch: string) {
    return this.pokemonService.findOne(termSearch);
  }

  @Patch(':termSearch')
  update(
    @Param('termSearch') termSearch: string,
    @Body() updatePokemonDto: UpdatePokemonDto,
  ) {
    return this.pokemonService.update(termSearch, updatePokemonDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseMoongoIdPipe) id: string) {
    return this.pokemonService.remove(id);
  }
}
