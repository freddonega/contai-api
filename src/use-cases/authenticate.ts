import { UserRepository } from "@/repositories/user-repository";
import { User } from "@prisma/client";
import { compare } from "bcryptjs";
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error";

interface AuthenticateUseCaseRequest {
  email: string;
  password: string;
}

interface AuthenticateUseCaseResponse {
  user: User;
}

export class AuthenticateUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }
    const isPasswordCorrectly = await compare(password, user.password_hash);
    if (!isPasswordCorrectly) {
      throw new InvalidCredentialsError();
    }
    return {
      user,
    };
  }
}
