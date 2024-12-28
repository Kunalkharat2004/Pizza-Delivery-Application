import app from "./app";
import config from "./config/config";
import logger from "./config/logger";

const main = () => {
  try {
    const PORT = config.PORT || 3000;

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
main();
