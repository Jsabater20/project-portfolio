import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProfesionalDto {

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsOptional()
  @IsIn(['mañana', 'tarde', 'ambos'])
  turno?: string;
}
