/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { checkSchema } from "express-validator";

const validateUserCredentials = checkSchema({
  firstName: {
    notEmpty: {
      errorMessage: "First name is required",
    },
    isAlpha: {
      errorMessage: "First name must be alphabetic",
    },
    trim: true,
  },
  lastName: {
    notEmpty: {
      errorMessage: "Last name is required!",
    },
    isAlpha: {
      errorMessage: "Last name must be alphabetic",
    },
    trim: true,
  },

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
    isLength: {
      options: { min: 8 },
      errorMessage: "Password must be at least 8 characters long",
    },
    custom: {
      options: (value) => {
        const errors = [];
        if (!/\d/.test(value)) {
          errors.push("Password must contain at least one number");
        }
        if (!/[A-Z]/.test(value)) {
          errors.push("Password must contain at least one uppercase letter");
        }
        if (!/[a-z]/.test(value)) {
          errors.push("Password must contain at least one lowercase letter");
        }
        if (!/[@$!%*?&#]/.test(value)) {
          errors.push("Password must contain at least one special character");
        }
        // if (errors.length > 0) {
        //   throw new Error(errors.join('. '));
        // }
        return true;
      },
    },
  },

  address: {
    notEmpty: {
      errorMessage: "Address is required!",
    },
    isString: {
      errorMessage: "Address must be a string",
    },
    trim: true,
  },
});

export default validateUserCredentials;
