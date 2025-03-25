import { checkSchema } from "express-validator";

const queryParam = checkSchema(
  {
    currentPage: {
      customSanitizer: {
        options: (value) => {
          const page = Number(value);
          return isNaN(page) ? 1 : page;
        },
      },
    },
    perPage: {
      customSanitizer: {
        options: (value) => {
          const perPage = Number(value);
          return isNaN(perPage) ? 6 : perPage;
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
