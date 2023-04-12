export const getValidationErrors = (err) => {
  let errors = {};

  if (err?.code === 11000) {
    errors.email = "This email is already taken, Please choose another email!";
    return errors;
  }

  Object.values(err.errors).forEach(({ properties }) => {
    errors[properties?.path] = properties?.message;
  });

  return errors;
};
