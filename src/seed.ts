import { config } from "dotenv";
import connectDB from "./config/db";
import { connection, Types } from "mongoose";
import bcrypt from "bcrypt";
import UserModel from "./models/user.model";
import WorkspaceModel from "./models/workspace.model";
import BoardModel from "./models/board.model";
import ListModel from "./models/list.model";
import CardModel from "./models/card.model";
import LabelModel from "./models/label.model";
import { LabelI } from "./types/label.types";
import { CustomError } from "./utils/errors/CustomError";
import { createLabels } from "./utils/boardUtilFuncs";

const SALT_ROUNDS = 10;

config();

const users = [
  {
    username: "john_doe",
    email: "john.doe@example.com",
    password: "123",
    firstName: "John",
    lastName: "Doe",
  },
  {
    username: "jane_smith",
    email: "jane.smith@example.com",
    password: "123",
    firstName: "Jane",
    lastName: "Smith",
  },
  {
    username: "eden",
    email: "eden@eden.com",
    password: "12345678Ed!",
    firstName: "Eden",
    lastName: "Roth",
  },
];

// Helper functions to create checklists
export function createChecklist(name: string, todos: any[] = []) {
  return {
    name,
    todos,
  };
}

async function createCardsOfCoding(
  adminId: any,
  position: number,
  listId: Types.ObjectId
) {}

async function createCard(
  title: string,
  adminId: any,
  position: number,
  listId: Types.ObjectId
) {
  const card = new CardModel({
    admin: adminId,
    title,
    position,
    list: listId,
    checklist: [createChecklist("Main Checklist")],
    dueDate: new Date(),
    members: [], // Optionally add members here
  });

  await card.save();
  return card;
}

async function createList(
  name: string,
  adminId: any,
  position: number,
  boardId: Types.ObjectId
) {
  const cards: any = [];
  const numOfCards = Math.floor(Math.random() * 4) + 1; // 1-4 cards

  const list = new ListModel({
    name,
    position,
    cards,
    board: boardId,
  });
  for (let i = 0; i < numOfCards; i++) {
    const card = await createCard(`Card ${i + 1}`, adminId, i + 1, list._id);
    cards.push(card._id);
  }

  await list.save();
  return list;
}

async function createBoard(name: string, adminId: any) {
  // const lists = [];
  const defaultLabels: LabelI[] = await LabelModel.find({ title: "/123" });
  if (!defaultLabels || !defaultLabels.length)
    throw new CustomError("Default Labels not found", 404);
  const defaultLabelsIds = defaultLabels.map((label: LabelI) => label._id);

  const board = new BoardModel({
    admin: adminId,
    name,
    bg: { background: "#0079BF", bgType: "color" }, // Example background color
    labels: [...defaultLabelsIds],
    members: [adminId],
    listsNumber: 3,
    // lists,
  });

  await board.save();
  for (let i = 0; i < 3; i++) {
    const list = await createList(`List ${i + 1}`, adminId, i + 1, board._id);
    // lists.push(list._id);
  }
  return board;
}

async function createWorkspace(name: string, admin: any) {
  const boards = [];

  for (let i = 0; i < 2; i++) {
    const board = await createBoard(`Board ${i + 1}`, admin._id);
    boards.push(board._id);
  }

  const workspace = new WorkspaceModel({
    name,
    shortName: name.slice(0, 3),
    description: `${name} description`,
    boards,
    members: [admin._id],
    admin: admin._id,
  });

  await workspace.save();
  return workspace;
}

async function seedDB() {
  console.log("Seeding database...");

  // try {
  //   await connectDB();

  //   // Clear existing data
  //   await UserModel.deleteMany({});
  //   await WorkspaceModel.deleteMany({});
  //   await BoardModel.deleteMany({});
  //   await ListModel.deleteMany({});
  //   await CardModel.deleteMany({});
  //   await LabelModel.deleteMany({});

  //   // Create users and their associated data

  //   await createLabels();

  //   const createdUsers = await Promise.all(
  //     users.map(async (u) => {
  //       const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS);
  //       const user = new UserModel({ ...u, password: hashedPassword });
  //       await user.save();

  //       const workspace = await createWorkspace(
  //         `${user.username}'s Workspace`,
  //         user
  //       );
  //       user.workspaces.push(workspace._id);
  //       await user.save();

  //       return user;
  //     })
  //   );

  //   console.log(
  //     "Database seeded successfully with users, workspaces, boards, lists, and cards."
  //   );
  // } catch (err) {
  //   console.error("Error seeding database:", err);
  // } finally {
  //   connection.close();
  // }
}

seedDB();
