import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateServicioDto {

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsInt()
  duracionMin!: number;

  @IsInt()
  precio!: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  profesionalesId?: number[];
}