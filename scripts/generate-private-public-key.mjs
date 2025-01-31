import { generateKeyPairSync } from "crypto";
import * as fs from "fs";
import logger from "../src/config/logger";

try {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  // Ensure the "certs" directory exists
  fs.mkdirSync("certs", { recursive: true });

  fs.writeFileSync("certs/private.pem", privateKey);
  fs.writeFileSync("certs/public.pem", publicKey);
} catch (error) {
  logger.error(error);
}
