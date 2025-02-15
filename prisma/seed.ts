import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Cria um usuário
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      password: hashedPassword, // Senha hasheada
      name: "John Doe", // New field
    },
  });

  // Cria categorias de despesa
  await prisma.category.createMany({
    data: [
      { name: "Luz", type: "expense", user_id: user.id },
      { name: "Água", type: "expense", user_id: user.id },
      { name: "Cartão de Crédito", type: "expense", user_id: user.id },
      { name: "Internet", type: "expense", user_id: user.id },
      { name: "Outros", type: "expense", user_id: user.id },
      { name: "Salário", type: "income", user_id: user.id },
      { name: "Outro", type: "income", user_id: user.id },
    ],
  });

  // Obtém todas as categorias criadas
  const allCategories = await prisma.category.findMany({
    where: { user_id: user.id },
  });

  // Cria entradas para o ano de 2024
  const entries: {
    amount: number;
    description: string;
    category_id: number;
    user_id: number;
    period: string;
    created_at: Date;
    updated_at: Date;
  }[] = [];

  for (let month = 0; month < 12; month++) {
    let hasSpecialIncome = false;

    for (let i = 0; i < 7; i++) {
      const randomCategory = allCategories[i];

      if (randomCategory.name === "Salário") {
        continue;
      }
      const amount = parseFloat((Math.random() * 100).toFixed(2));
      const date = new Date(2024, month, i + 1);

      entries.push({
        amount: amount,
        description: `Descrição para entrada ${month * 5 + i + 1}`,
        category_id: randomCategory.id,
        user_id: user.id,
        period: `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`,
        created_at: date,
        updated_at: date,
      });
    }

    // Adiciona uma entrada de income de 8400 se ainda não foi adicionada
    if (!hasSpecialIncome) {
      const incomeCategories = allCategories.filter(
        (category) => category.type === "income"
      );
      const randomCategory = incomeCategories.find(
        (category) => category.name === "Salário"
      );

      if (!randomCategory) {
        throw new Error("Categoria 'Salário' não encontrada");
      }

      const specialDate = new Date(2024, month, 1);
      entries.push({
        amount: 8400,
        description: "Entrada de renda especial",
        category_id: randomCategory.id,
        user_id: user.id,
        period: `${specialDate.getFullYear()}-${(specialDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`,
        created_at: specialDate,
        updated_at: specialDate,
      });
      hasSpecialIncome = true;
    }
  }

  await prisma.entry.createMany({
    data: entries,
  });

  console.log("Seeding concluído");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
