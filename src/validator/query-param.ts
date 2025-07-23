import { checkSchema } from "express-validator";

const queryParam = checkSchema(
  {
    page: {
      customSanitizer: {
        options: (value) => {
          const page = Number(value);
          return page < 1 ? 1 : isNaN(page) ? 1 : page;
        },
      },
    },
    limit: {
      customSanitizer: {
        options: (value) => {
          const limit = Number(value);
          return limit < 1 ? 5 : isNaN(limit) ? 5 : limit;
        },
      },
    },
    q: {
      trim: true,
      customSanitizer: {
        options: (value: string) => {
          return value ? String(value).trim() : "";
        },
      },
    },
    role: {
      customSanitizer: {
        options: (value: string) => {
          return value ?? "";
        },
      },
    },
  },
  ["query"]
);

export default queryParam;
