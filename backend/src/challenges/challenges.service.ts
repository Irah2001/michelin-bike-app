import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from '../entities/challenge.entity';
import { ChallengeParticipant } from '../entities/challenge-participant.entity';
import { User } from '../entities/user.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private challengeRepo: Repository<Challenge>,
    @InjectRepository(ChallengeParticipant)
    private participantRepo: Repository<ChallengeParticipant>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  findAll() {
    return this.challengeRepo.find({
      where: { is_active: true },
      relations: ['creator', 'participants'],
      order: { start_date: 'DESC' },
    });
  }

  async findOne(id: string) {
    const challenge = await this.challengeRepo.findOne({
      where: { id },
      relations: ['creator', 'participants', 'participants.user'],
    });
    if (!challenge) throw new NotFoundException(`Challenge ${id} introuvable`);
    return challenge;
  }

  async create(dto: CreateChallengeDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.created_by } });
    if (!user) throw new NotFoundException(`Utilisateur ${dto.created_by} introuvable`);
    if (!user.is_ambassador) throw new ForbiddenException('Seuls les ambassadeurs peuvent créer un challenge');

    const challenge = this.challengeRepo.create({
      ...dto,
      start_date: new Date(dto.start_date),
      end_date: new Date(dto.end_date),
    });
    return this.challengeRepo.save(challenge);
  }

  async join(id: string, userId: string) {
    const challenge = await this.challengeRepo.findOne({ where: { id } });
    if (!challenge) throw new NotFoundException(`Challenge ${id} introuvable`);
    if (!challenge.is_active) throw new ConflictException('Ce challenge n\'est plus actif');

    const existing = await this.participantRepo.findOne({
      where: { challenge_id: id, user_id: userId },
    });
    if (existing) throw new ConflictException('Vous participez déjà à ce challenge');

    const participant = this.participantRepo.create({ challenge_id: id, user_id: userId });
    return this.participantRepo.save(participant);
  }

  async leaderboard(id: string) {
    const challenge = await this.challengeRepo.findOne({ where: { id } });
    if (!challenge) throw new NotFoundException(`Challenge ${id} introuvable`);

    const participants = await this.participantRepo.find({
      where: { challenge_id: id },
      relations: ['user'],
      order: { contributed_km: 'DESC' },
    });

    return {
      challenge_id: id,
      title: challenge.title,
      target_km: challenge.target_km,
      current_km: challenge.current_km,
      progress_pct: Math.min(100, Math.round((challenge.current_km / challenge.target_km) * 100)),
      participants: participants.map((p, index) => ({
        rank: index + 1,
        user_id: p.user_id,
        name: p.user?.name ?? 'Inconnu',
        avatar_url: p.user?.avatar_url ?? null,
        contributed_km: p.contributed_km,
        joined_at: p.joined_at,
      })),
    };
  }
}
