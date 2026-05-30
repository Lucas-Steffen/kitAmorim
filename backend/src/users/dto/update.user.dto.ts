import { createUserDto } from "./create.user.dto";
import { PartialType } from "@nestjs/swagger";

export class updateUserDto extends PartialType(createUserDto) {
}