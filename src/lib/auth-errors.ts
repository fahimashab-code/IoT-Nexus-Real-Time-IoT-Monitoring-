export function getAuthErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Something went wrong. Please try again.";
  }

  const name = "name" in error ? String(error.name) : "";
  const message = "message" in error ? String(error.message) : "";

  switch (name) {
    case "UserNotFoundException":
      return "No account found with that email.";
    case "NotAuthorizedException":
      return "Incorrect email or password.";
    case "UserNotConfirmedException":
      return "Please verify your email before signing in.";
    case "UsernameExistsException":
      return "An account with that email already exists.";
    case "CodeMismatchException":
      return "The verification code is invalid.";
    case "ExpiredCodeException":
      return "That code has expired. Request a new one.";
    case "LimitExceededException":
      return "Too many attempts. Please try again later.";
    default:
      return message || "Something went wrong. Please try again.";
  }
}
