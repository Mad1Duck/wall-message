import { Controller, Get, Post, Put, Delete, Param, Body, HttpException } from 'hono-forge';
import { z } from 'zod';
import { MiniWallsService } from '../services/mini-walls.service';
import { WallsService } from '../services/walls.service';

const CreateMiniWallSchema = z.object({
  wall_id: z.string().uuid(),
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(30).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).default(''),
});

const UpdateMiniWallSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  slug: z.string().min(1).max(30).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens').optional(),
  description: z.string().max(500).optional(),
});

@Controller('/mini-walls')
export class MiniWallsController {
  private miniWallsService = new MiniWallsService();
  private wallsService = new WallsService();

  @Get('/wall/:wallId')
  async getByWallId(@Param('wallId') wallId: string) {
    return this.miniWallsService.getByWallId(wallId);
  }

  @Get('/wall/:wallId/:slug')
  async getBySlug(@Param('wallId') wallId: string, @Param('slug') slug: string) {
    const miniWall = await this.miniWallsService.getBySlug(wallId, slug);
    if (!miniWall) throw new HttpException(404, 'Mini wall not found');
    return miniWall;
  }

  @Get('/:id')
  async getById(@Param('id') id: string) {
    const miniWall = await this.miniWallsService.getById(id);
    if (!miniWall) throw new HttpException(404, 'Mini wall not found');
    return miniWall;
  }

  @Post()
  async create(@Body(CreateMiniWallSchema) body: z.infer<typeof CreateMiniWallSchema>) {
    const wall = await this.wallsService.getById(body.wall_id);
    if (!wall) throw new HttpException(404, 'Wall not found');

    const miniWall = await this.miniWallsService.create({
      wallId: body.wall_id,
      name: body.name,
      slug: body.slug,
      description: body.description,
    });
    if (!miniWall) throw new HttpException(409, 'Slug already taken');
    return miniWall;
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body(UpdateMiniWallSchema) body: z.infer<typeof UpdateMiniWallSchema>) {
    const miniWall = await this.miniWallsService.update(id, body);
    if (!miniWall) throw new HttpException(404, 'Mini wall not found or slug already taken');
    return miniWall;
  }

  @Delete('/:id')
  async remove(@Param('id') id: string) {
    const miniWall = await this.miniWallsService.remove(id);
    if (!miniWall) throw new HttpException(404, 'Mini wall not found');
    return miniWall;
  }

  @Get('/:id/message-count')
  async getMessageCount(@Param('id') id: string) {
    const count = await this.miniWallsService.getMessageCount(id);
    return { count };
  }
}
