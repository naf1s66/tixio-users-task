import { IsIn, IsOptional, IsString } from "class-validator";

export class GetUsersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(["admin", "editor", "viewer"])
  role?: "admin" | "editor" | "viewer";
}
