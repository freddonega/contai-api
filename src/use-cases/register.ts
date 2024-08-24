import { prisma } from "@/lib/prisma";

import { hash } from "bcryptjs";
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error";
import { User } from "@prisma/client";

interface RegisterUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

interface RegisterUseCaseResponse {
  user: User;
}

export class RegisterUseCase {
  constructor(private userRepository: any) {}

  async execute({
    name,
    email,
    password,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const userWithSomeEmail = await this.userRepository.findByEmail(email);

    if (userWithSomeEmail) {
      throw new UserAlreadyExistsError();
    }

    const password_hash = await hash(password, 6);

    const user = await this.userRepository.create({
      name,
      email,
      password_hash,
    });

    return { user };
  }
}
