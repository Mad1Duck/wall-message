import { Controller, Get, Post, Body, Param } from 'hono-forge';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { WallsService } from '../services/walls.service';

const CreateWallSchema = z.object({
  clerk_uid: z.string().min(1),
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/),
  display_name: z.string().min(1).max(40),
  bio: z.string().max(100).default(''),
  avatar_url: z.string().default(''),
});

@Controller('/api/walls')
export class WallsController {
  constructor(private wallsService: WallsService) { }

  @Get()
  getAll() {
    return this.wallsService.getAll();
  }

  @Get('/by-clerk/:clerkUid')
  async getByClerkUid(@Param('clerkUid') clerkUid: string) {
    const wall = await this.wallsService.getByClerkUid(clerkUid);
    if (!wall) throw new HTTPException(404, { message: 'Wall not found' });
    return wall;
  }

  @Get('/my/:clerkUid')
  async getMyWalls(@Param('clerkUid') clerkUid: string) {
    return this.wallsService.getWallsByClerkUid(clerkUid);
  }

  @Get('/by-username/:username')
  async getByUsername(@Param('username') username: string) {
    const wall = await this.wallsService.getByUsername(username);
    if (!wall) throw new HTTPException(404, { message: 'Wall not found' });
    return wall;
  }

  @Get('/check-username/:username')
  async checkUsername(@Param('username') username: string) {
    const available = await this.wallsService.isUsernameAvailable(username);
    return { available };
  }

  @Post()
  async create(@Body(CreateWallSchema) body: z.infer<typeof CreateWallSchema>) {
    const available = await this.wallsService.isUsernameAvailable(body.username);
    if (!available) throw new HTTPException(409, { message: 'Username already taken' });

    const wall = await this.wallsService.create({
      clerkUid: body.clerk_uid,
      username: body.username,
      displayName: body.display_name,
      bio: body.bio,
      avatarUrl: body.avatar_url,
    });
    if (!wall) throw new HTTPException(500, { message: 'Failed to create wall' });
    return wall;
  }
}
