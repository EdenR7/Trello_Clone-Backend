import { Router } from "express";
import {
  getUserWorkspaces,
  getWorkspace,
} from "../controllers/workspace.controller";

const workspaceRouter = Router();

workspaceRouter.get("/", getUserWorkspaces);
workspaceRouter.get("/:id", getWorkspace);

export default workspaceRouter;
