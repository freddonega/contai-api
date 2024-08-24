import { UserRepository } from "@/repositories/user-repository";
import { User } from "@prisma/client";
import { ResourceNotFoundError } from "@/use-cases/errors/resource-not-found";

interface GetUserProfileUseCaseRequest {
  userId: string;
}

interface AuthenticateUseCaseResponse {
  user: User;
}

export class GetUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
  }: GetUserProfileUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ResourceNotFoundError();
    }

    return {
      user,
    };
  }
}
