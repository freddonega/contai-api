import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import fs from "fs";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance API",
      version: "1.0.0",
      description: "API para gerenciar entradas e saídas financeiras",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Caminhos para os arquivos de rotas e controladores
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Rota para exportar a especificação Swagger em formato JSON com download
  app.get("/collection", (req, res) => {
    const filePath = path.join(__dirname, "swagger-collection.json");

    // Grava a especificação Swagger em um arquivo JSON
    fs.writeFileSync(filePath, JSON.stringify(swaggerSpec, null, 2));

    // Define os cabeçalhos para o download do arquivo
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=swagger-collection.json"
    );
    res.setHeader("Content-Type", "application/json");

    // Envia o arquivo para download
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(500).send("Erro ao enviar o arquivo.");
      }

      // Remove o arquivo após o download

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Erro ao remover o arquivo:", err);
        }
      });
    });
  });
};
