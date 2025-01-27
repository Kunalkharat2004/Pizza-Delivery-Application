import { checkSchema } from "express-validator";

const validateUserCredentials = checkSchema({
  email: {
    notEmpty: {
      errorMessage: "Email is required",
    },
    isEmail: {
      errorMessage: "Invalid email",
    },
    trim: true,
  },
});

export default validateUserCredentials;
