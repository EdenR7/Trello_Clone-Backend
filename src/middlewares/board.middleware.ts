import { NextFunction, Response } from "express";
import { AuthRequestWithBoard } from "../types/board.types";
import { ListI } from "../types/list.types";

export function sortBoardLists(
  req: AuthRequestWithBoard,
  res: Response,
  next: NextFunction
) {
  console.log("sortBoardLists");

  if (req.board && req.board.lists && Array.isArray(req.board.lists)) {
    req.board.lists.sort((a: unknown, b: unknown) => {
      if ((a as ListI).position && (b as ListI).position) {
        return (a as ListI).position - (b as ListI).position;
      }
      return 0;
    });
  }
  res.status(200).json(req.board);
}
