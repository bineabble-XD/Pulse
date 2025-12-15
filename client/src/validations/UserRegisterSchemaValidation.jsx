import * as yup from "yup";

export const UserRegisterSchemaValidation = yup.object().shape({
  name: yup
    .string()
    .required("First Name is required")
    .matches(/^[A-Za-z\s]+$/, "Name must contain letters only"),
  lastName: yup
    .string()
    .required("Last name is required")
    .matches(/^[A-Za-z\s]+$/, "Last name must contain letters only"),
  email: yup
    .string()
    .email("Not a Valid Email Format!!")
    .required("Email is Required.."),
  password: yup
    .string()
    .required("Password is Required..")
    .min(8, "Minimum 8 characters required..")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Must contain at least one special character"
    ),
  address: yup
    .string()
    .required("Address is required")
    .max(20, "Address must be at most 20 characters"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^\d{8}$/, "Phone number must be exactly 8 digits"),
  age: yup
    .number()
    .typeError("Age is required")
    .min(18, "Minimum age is 18")
    .required("Age is required"),
  gender: yup.string().required("Gender is required"),
  username: yup
    .string()
    .required("Username is required")
    .min(3, "At least 3 characters"),
});
