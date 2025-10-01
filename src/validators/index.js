import { body, validationResult } from "express-validator";

const userRegisterValidator = () =>{
     return [
        body("email")
             .trim()
             .notEmpty()
             .withMessage("Email is required")
             .isEmail()
             .withMessage("Email is invalid"),
        body("username")
             .trim()
             .notEmpty()
             .withMessage("username is required")
             .isLowercase()
             .withMessage("username need to be lowercase")
             .isLength({min:3})
             .withMessage("Username must be at least 3 char"),
        body("password")
            .trim()
             .notEmpty()
             .withMessage("password is required"),
        body("fullName")
           .trim()
           .optional()
     ]
}

const userLoginValidator = () =>{
     return [
          body("email")
            .isEmail()
            .optional()
            .withMessage("email is invalid"),
          body("password")
            .isEmpty()
            .withMessage("password is required")
     ]
}

export {
    userRegisterValidator,
    userLoginValidator
}