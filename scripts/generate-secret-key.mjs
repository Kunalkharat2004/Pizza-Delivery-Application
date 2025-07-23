 
import { randomBytes } from "crypto";

const secretKey = randomBytes(32).toString("hex"); // 32 bytes = 256-bit key
// console.log(secretKey);
