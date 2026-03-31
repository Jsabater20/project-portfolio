import { IsDateString, IsInt } from 'class-validator';

export class CreateTurnoDto {

  @IsDateString()
  inicio!: string; // viene como string (ISO)

  @IsInt()
  clienteId!: number;

  @IsInt()
  servicioId!: number;

  @IsInt()
  profesionalId!: number;
}