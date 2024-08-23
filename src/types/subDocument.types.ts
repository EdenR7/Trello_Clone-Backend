import { Types } from "mongoose";

export interface BoardSubDocumentI {
    boardId: Types.ObjectId;
    title: string;
    boardBg: string;
  }
  export interface ActivitySubDocumentI {
    by: Types.ObjectId; // user Id
    where: Types.ObjectId; // card Id
    when: Date;
    description: string;
  }