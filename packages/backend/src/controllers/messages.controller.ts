import { Controller, Get, Post, Patch, Delete, Body, Param } from 'hono-forge';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { MessagesService } from '../services/messages.service';

const CreateMessageSchema = z.object({
  wall_id: z.string().uuid(),
  recipient: z.string().min(1),
  content: z.string().min(1).max(500),
  alias: z.string().max(100).default('Seseorang yang peduli 🌙'),
});

const UpdateMessageSchema = z.object({
  reply: z.string().optional(),
  is_public: z.boolean().optional(),
  is_pinned: z.boolean().optional(),
});

const ReactSchema = z.object({
  type: z.enum(['heart', 'fire', 'cry']),
});

@Controller('/api/messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) { }

  @Get('/by-wall/:wallId')
  async getByWallId(@Param('wallId') wallId: string) {
    if (!wallId) throw new HTTPException(400, { message: 'wall_id is required' });
    return this.messagesService.getByWallId(wallId);
  }

  @Get('/stats')
  getStats() {
    return this.messagesService.getStats();
  }

  @Get('/:id')
  async getById(@Param('id') id: string) {
    const msg = await this.messagesService.getById(id);
    if (!msg) throw new HTTPException(404, { message: 'Message not found' });
    return msg;
  }

  @Post()
  async create(@Body(CreateMessageSchema) body: z.infer<typeof CreateMessageSchema>) {
    const msg = await this.messagesService.create({
      wallId: body.wall_id,
      recipient: body.recipient,
      content: body.content,
      alias: body.alias,
    });
    if (!msg) throw new HTTPException(500, { message: 'Failed to send message' });
    return msg;
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body(UpdateMessageSchema) body: z.infer<typeof UpdateMessageSchema>,
  ) {
    const updateData: {
      reply?: string;
      isPublic?: boolean;
      isPinned?: boolean;
    } = {};
    if (body.reply !== undefined) updateData.reply = body.reply;
    if (body.is_public !== undefined) updateData.isPublic = body.is_public;
    if (body.is_pinned !== undefined) updateData.isPinned = body.is_pinned;

    const msg = await this.messagesService.updateById(id, updateData);
    if (!msg) throw new HTTPException(404, { message: 'Message not found' });
    return msg;
  }

  @Delete('/:id')
  async remove(@Param('id') id: string) {
    const msg = await this.messagesService.deleteById(id);
    if (!msg) throw new HTTPException(404, { message: 'Message not found' });
    return { success: true };
  }

  @Post('/:id/react')
  async react(
    @Param('id') id: string,
    @Body(ReactSchema) body: z.infer<typeof ReactSchema>,
  ) {
    const msg = await this.messagesService.getById(id);
    if (!msg) throw new HTTPException(404, { message: 'Message not found' });

    const type = body.type as 'heart' | 'fire' | 'cry';
    const updateData =
      type === 'heart'
        ? { reactHeart: msg.react_heart + 1 }
        : type === 'fire'
          ? { reactFire: msg.react_fire + 1 }
          : { reactCry: msg.react_cry + 1 };

    const updated = await this.messagesService.updateById(id, updateData);
    if (!updated) throw new HTTPException(500, { message: 'Failed to react' });
    return updated;
  }
}
