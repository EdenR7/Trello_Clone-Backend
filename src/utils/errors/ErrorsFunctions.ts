import { CustomError } from "./CustomError";

export function getErrorMessage(error: unknown) {
  if (error instanceof Error || error instanceof CustomError) {
    return error.message as string;
  } else if (
    error !== null &&
    typeof error === "object" &&
    "message" in error
  ) {
    return error.message as string;
  } else if (typeof error === "string") {
    return error as string;
  } else {
    return "An unknown error occurred";
  }
}

export function getErrorName(error: unknown) {
  if (error instanceof Error || error instanceof CustomError) {
    return error.name as string;
  } else if (error !== null && typeof error === "object" && "name" in error) {
    return error.name as string;
  } else if (typeof error === "string") {
    return error as string;
  } else {
    return "Unknown error name";
  }
}

export function getErrorData(error: unknown) {
  const errorName = getErrorName(error);
  const errorMessage = getErrorMessage(error);
  return { errorName, errorMessage };
}
