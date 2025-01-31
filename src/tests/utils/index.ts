/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataSource } from "typeorm";

export const truncateTable = async (connection: DataSource) => {
  const entities = connection.entityMetadatas;
  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.clear();
  }
};

export const isJWT = (token: string | null): boolean => {
  if (token === null) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  // Check whether the part is a Base64 encoded string
  try {
    parts.forEach((part) => {
      Buffer.from(part, "base64").toString("utf-8");
    });
    return true;
  } catch (err) {
    return false;
  }
};
