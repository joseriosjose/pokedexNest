import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  /*solo en el constructor se puede hacer injeccion de dependencias*/
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExeptions(error);
    }
  }

  findAll(queryParameters: PaginationDto) {
    const { limit = 10, offset = 0 } = queryParameters;
    return this.pokemonModel
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 })
      .select('-__v');
  }

  async findOne(termSearch: string) {
    let pokemon: Pokemon;
    //busqueda por nombre
    if (!isNaN(+termSearch)) {
      pokemon = await this.pokemonModel.findOne({ no: termSearch });
    }
    //busqueda por id de mongo
    if (!pokemon && isValidObjectId(termSearch)) {
      pokemon = await this.pokemonModel.findById(termSearch);
    }
    // busqueda por nombre
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: termSearch.toLocaleLowerCase().trim(),
      });
    }

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or no, ${termSearch}, not found`,
      );

    return pokemon;
  }

  async update(termSearch: string, updatePokemonDto: UpdatePokemonDto) {
    //este pokemon es un objeto de mongo incluye todo lo que un modelo de mongo provee
    const pokemon = await this.findOne(termSearch);
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase().trim();
    }

    try {
      await pokemon.updateOne(updatePokemonDto, {
        new: true,
      });
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExeptions(error);
    }
  }

  async remove(id: string) {
    //const pokemon = await this.findOne(id);
    //await pokemon.deleteOne();
    // const result = await this.pokemonModel.findByIdAndDelete(id);
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id ${id} not found`);
    }

    return;
  }

  private handleExeptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error);
    throw new InternalServerErrorException(
      `Can't create Pokemon - Check Server logs`,
    );
  }
}
