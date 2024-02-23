import { CreateMatchDto } from "./create-match.dto";
import { PartialType } from '@nestjs/mapped-types';

export class UpdateMatchDto extends PartialType(CreateMatchDto) {}