import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string) {
    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email déjà utilisé');

    const password_hash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ email, password_hash, name });
    await this.userRepo.save(user);

    return { access_token: this.jwtService.sign({ sub: user.id, email: user.email }) };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.password_hash) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return { access_token: this.jwtService.sign({ sub: user.id, email: user.email }) };
  }
}
