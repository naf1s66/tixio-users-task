import { Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { ApiOkResponse, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { GetUsersQueryDto } from "./dto/get-users.query.dto";

@ApiTags("users")
@Controller()
export class UsersController {
  constructor(private users: UsersService) {}

  @Get("users")
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "role", required: false, enum: ["admin", "editor", "viewer"] })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiOkResponse({ description: "List users with pagination" })
  list(@Query() query: GetUsersQueryDto) {
    return this.users.list(query);
  }

  @Get("users/:id")
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "Get user by id" })
  get(@Param("id") id: string) {
    return this.users.getById(id);
  }

  @Patch("users/:id/toggle-active")
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "Toggle active" })
  toggle(@Param("id") id: string) {
    return this.users.toggleActive(id);
  }
}
