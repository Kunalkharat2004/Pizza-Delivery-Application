import app from "./app";
import config from "./config/config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";

const main = async () => {
  try {
    const PORT = config.PORT ?? 3000;

    await AppDataSource.initialize();
    logger.info("Database connected successfully");

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};
main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
