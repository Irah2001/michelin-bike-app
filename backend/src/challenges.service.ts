import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from './entities/challenge.entity';
import { ChallengeParticipant } from './entities/challenge-participant.entity';
import { CreateChallengeDto } from './dto/challenges.dto';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge) private challengeRepo: Repository<Challenge>,
    @InjectRepository(ChallengeParticipant) private participantRepo: Repository<ChallengeParticipant>,
  ) {}

  async findAll(page = 1, limit = 20, userId?: string) {
    const [data, total] = await this.challengeRepo.findAndCount({
      where: { is_active: true },
      relations: { participants: true },
      order: { start_date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const enriched = data.map(c => ({
      ...c,
      participant_count: c.participants?.length || 0,
      is_participant: userId ? c.participants?.some(p => p.user_id === userId) : false,
      participants: undefined,
    }));
    return { data: enriched, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async create(userId: string, dto: CreateChallengeDto) {
    const challenge = this.challengeRepo.create({
      created_by: userId,
      title: dto.title,
      description: dto.description,
      target_km: dto.target_km,
      start_date: new Date(dto.start_date),
      end_date: new Date(dto.end_date),
      reward_description: dto.reward_description,
    });
    const saved = await this.challengeRepo.save(challenge);
    // Auto-join creator
    await this.participantRepo.save(this.participantRepo.create({
      challenge_id: saved.id,
      user_id: userId,
    }));
    return saved;
  }

  async join(challengeId: string, userId: string) {
    const challenge = await this.challengeRepo.findOne({ where: { id: challengeId } });
    if (!challenge) throw new NotFoundException('Challenge non trouvé');

    const exists = await this.participantRepo.findOne({ where: { challenge_id: challengeId, user_id: userId } });
    if (exists) throw new ConflictException('Déjà inscrit à ce challenge');

    return this.participantRepo.save(this.participantRepo.create({ challenge_id: challengeId, user_id: userId }));
  }

  async leaderboard(challengeId: string) {
    const participants = await this.participantRepo.find({
      where: { challenge_id: challengeId },
      relations: { user: true },
      order: { contributed_km: 'DESC' },
    });
    return participants.map((p, i) => ({
      rank: i + 1,
      user_id: p.user_id,
      name: p.user.name,
      avatar_url: p.user.avatar_url,
      contributed_km: p.contributed_km,
    }));
  }
}
