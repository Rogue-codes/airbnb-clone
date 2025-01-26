import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsArray,
    MaxLength,
    Min,
    Max,
    IsEnum,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
import { CATEGORIES } from '../entities/room.entity';
  
  class LocationDto {
    @IsString()
    @IsNotEmpty()
    country: string;
  
    @IsString()
    @IsNotEmpty()
    street_address: string;
  
    @IsString()
    @IsOptional()
    floor?: string;
  
    @IsString()
    @IsNotEmpty()
    city: string;
  
    @IsString()
    @IsNotEmpty()
    state: string;
  
    @IsString()
    @IsNotEmpty()
    postal_code: string;
  }
  
  export class CreateRoomDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    title: string;
  
    @IsEnum(CATEGORIES)
    @IsNotEmpty()
    category: CATEGORIES;
  
    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;
  
    @IsNumber()
    @Min(1)
    max_number_of_guests: number;
  
    @IsNumber()
    @Min(1)
    number_of_rooms: number;
  
    @IsNumber()
    @Min(1)
    number_of_beds: number;
  
    @IsNumber()
    @Min(1)
    number_of_bathrooms: number;
  
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    amenities?: string[];
  
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];
  
    @IsString()
    @IsNotEmpty()
    description: string;
  
    @IsNumber()
    @Min(0)
    price: number;
  
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    discount?: number;
  }
  