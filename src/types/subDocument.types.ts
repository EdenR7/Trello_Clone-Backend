import { Types } from "mongoose";
import { bgTypeOptions } from "./board.types";

export interface BoardSubDocumentI {
  boardId: Types.ObjectId;
  name: string;
  boardBg: { background: string; bgType: bgTypeOptions };
}
export interface ActivitySubDocumentI {
  by: Types.ObjectId; // user Id
  where: Types.ObjectId; // card Id
  when: Date;
  description: string;
}

export interface MemberSubDocumentI {
  memberId: Types.ObjectId;
  username: string;
  firstName: string;
  lastName: string;
  // avatar: string;
  // role: string;
}
