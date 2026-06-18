import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, ConflictException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from './entities/user.entity';
import { Friendship } from './entities/friendship.entity';

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

@ApiTags('Friends')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Friendship) private friendRepo: Repository<Friendship>,
  ) {}

  @Get('code')
  @ApiOperation({ summary: 'Get my friend code (generates one if missing)' })
  async getMyCode(@Req() req: any) {
    const user = await this.userRepo.findOne({ where: { id: req.user.sub } });
    if (!user) throw new NotFoundException();
    if (!user.friend_code) {
      user.friend_code = generateCode();
      await this.userRepo.save(user);
    }
    return { friend_code: user.friend_code };
  }

  @Post('add')
  @ApiOperation({ summary: 'Add a friend by their code' })
  async addFriend(@Req() req: any, @Body() body: { code: string }) {
    const friend = await this.userRepo.findOne({ where: { friend_code: body.code?.toUpperCase() } });
    if (!friend) throw new NotFoundException('Code ami invalide');
    if (friend.id === req.user.sub) throw new ConflictException('Vous ne pouvez pas vous ajouter vous-même');

    const existing = await this.friendRepo.findOne({ where: { user_id: req.user.sub, friend_id: friend.id } });
    if (existing) throw new ConflictException('Déjà ami');

    // Bidirectional friendship
    await this.friendRepo.save([
      this.friendRepo.create({ user_id: req.user.sub, friend_id: friend.id }),
      this.friendRepo.create({ user_id: friend.id, friend_id: req.user.sub }),
    ]);

    return { message: 'Ami ajouté', friend: { id: friend.id, name: friend.name, avatar_url: friend.avatar_url } };
  }

  @Get()
  @ApiOperation({ summary: 'List my friends' })
  async listFriends(@Req() req: any) {
    const friendships = await this.friendRepo.find({
      where: { user_id: req.user.sub },
      relations: { friend: true },
    });
    return friendships.map(f => ({
      id: f.friend.id,
      name: f.friend.name,
      avatar_url: f.friend.avatar_url,
      xp: f.friend.xp,
      level: f.friend.level,
      level_name: f.friend.level_name,
      added_at: f.created_at,
    }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a friend' })
  async removeFriend(@Req() req: any, @Param('id') friendId: string) {
    await this.friendRepo.delete({ user_id: req.user.sub, friend_id: friendId });
    await this.friendRepo.delete({ user_id: friendId, friend_id: req.user.sub });
    return { message: 'Ami supprimé' };
  }
}
