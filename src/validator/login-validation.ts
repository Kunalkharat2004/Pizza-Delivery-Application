import { checkSchema } from "express-validator";

const validateLoginCredentials = checkSchema({
  email: {
    notEmpty: {
      errorMessage: "Email is required",
    },
    isEmail: {
      errorMessage: "Invalid email",
    },
    trim: true,
  },

  password: {
    notEmpty: {
      errorMessage: "Password should not be empty",
    },
    isString: {
      errorMessage: "Password must be a valid string",
    },
  },
});

export default validateLoginCredentials;
