import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryUserRepository } from "@/repositories/in-memory/in-memory-user-repository";
import { hash } from "bcryptjs";
import { GetUserProfileUseCase } from "@/use-cases/get-user-profile";
import { ResourceNotFoundError } from "@/use-cases/errors/resource-not-found";

let userRepository: InMemoryUserRepository;
let sut: GetUserProfileUseCase;

describe("Authenticate use case", () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new GetUserProfileUseCase(userRepository);
  });

  it("should be able to find user", async () => {
    const createdUser = await userRepository.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password_hash: await hash("123456", 6),
    });

    const { user } = await sut.execute({
      userId: createdUser.id,
    });

    expect(user.id).toEqual(expect.any(String));
  });

  it("should not be able to find user with wrong id", async () => {
    await expect(() =>
      sut.execute({
        userId: "non-existing-user-id",
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
