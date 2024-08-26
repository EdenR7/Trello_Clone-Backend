import { NextFunction, Request, Response } from "express";
import { getErrorData } from "../utils/errors/ErrorsFunctions";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  const { errorName, errorMessage, statusCode } = getErrorData(err);
  console.log(errorName, errorMessage);
  if (errorName === "CastError")
    return res.status(404).json({ message: errorMessage });
  if (errorName === "ValidationError")
    return res.status(401).json({ message: errorMessage });
  return res.status(statusCode).json({ message: errorMessage });
};
