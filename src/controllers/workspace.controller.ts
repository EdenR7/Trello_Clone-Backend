import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import WorkspaceModel from "../models/workspace.model";
import { CustomError } from "../utils/errors/CustomError";
import { VALIDATE_USER } from "../utils/boardUtilFuncs";

export async function getWorkspace(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  try {
    const workspace = await WorkspaceModel.findOne({
      _id: id,
      ...VALIDATE_USER(req),
    }).populate("boards");
    if (!workspace) throw new CustomError("Workspace not found", 404);

    return res.status(200).json(workspace);
  } catch (error) {
    console.log("getWorkspace error: ");
    next(error);
  }
}

export async function getUserWorkspaces(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const workspaces = await WorkspaceModel.find({ ...VALIDATE_USER(req) });
    if (!workspaces) throw new CustomError("Workspaces not found", 404);
    return res.status(200).json(workspaces);
  } catch (error) {
    console.log("getUserWorkspaces error: ");
    next(error);
  }
}
