import { checkSchema } from "express-validator";

const queryParam = checkSchema(
  {
    currentPage: {
      customSanitizer: {
        options: (value) => {
          const page = Number(value);
          return page < 1 ? 1 : isNaN(page) ? 1 : page;
        },
      },
    },
    perPage: {
      customSanitizer: {
        options: (value) => {
          const perPage = Number(value);
          return perPage < 1 ? 5 : isNaN(perPage) ? 5 : perPage;
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
