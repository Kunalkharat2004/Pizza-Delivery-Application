import { checkSchema } from "express-validator";

const validateTenant = checkSchema({
  name: {
    notEmpty: {
      errorMessage: "Name is required",
    },
    isString: {
      errorMessage: "Name must be a string",
    },
    trim: true,
  },
  address: {
    notEmpty: {
      errorMessage: "Address is required",
    },
    isString: {
      errorMessage: "Address must be a string",
    },
    trim: true,
  },
});

export default validateTenant;
