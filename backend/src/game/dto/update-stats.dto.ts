import { CreateStatsDto } from "./create-stats.dto";
import { PartialType } from '@nestjs/mapped-types';

export class UpdateStatsDto extends PartialType(CreateStatsDto) {}