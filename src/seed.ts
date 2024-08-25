import { config } from "dotenv";
import connectDB from "./config/db";
import { connection } from "mongoose";
import bcrypt from "bcrypt";
import UserModel from "./models/user.model";
import WorkspaceModel from "./models/workspace.model";
import BoardModel from "./models/board.model";
import ListModel from "./models/list.model";
import CardModel from "./models/card.model";

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
function createChecklist(name: string) {
  return {
    name,
    todos: [
      { title: "Todo 1", isComplete: false },
      { title: "Todo 2", isComplete: false },
    ],
  };
}

async function createCard(title: string, adminId: any, position: number) {
  const card = new CardModel({
    admin: adminId,
    title,
    position,
    checklist: [createChecklist("Main Checklist")],
    dueDate: new Date(),
    members: [], // Optionally add members here
  });

  await card.save();
  return card;
}

async function createList(name: string, adminId: any, position: number) {
  const cards = [];
  const numOfCards = Math.floor(Math.random() * 4) + 1; // 1-4 cards

  for (let i = 0; i < numOfCards; i++) {
    const card = await createCard(`Card ${i + 1}`, adminId, i + 1);
    cards.push(card._id);
  }

  const list = new ListModel({
    name,
    position,
    cards,
  });

  await list.save();
  return list;
}

async function createBoard(name: string, adminId: any) {
  const lists = [];

  for (let i = 0; i < 3; i++) {
    const list = await createList(`List ${i + 1}`, adminId, i + 1);
    lists.push(list._id);
  }

  const board = new BoardModel({
    admin: adminId,
    name,
    bg: "#ffffff", // Example background color
    lists,
  });

  await board.save();
  return board;
}

async function createWorkspace(name: string, admin: any) {
  const boards = [];

  for (let i = 0; i < 2; i++) {
    const board = await createBoard(`Board ${i + 1}`, admin._id);
    boards.push({
      boardId: board._id,
      title: board.name,
      boardBg: board.bg,
    });
  }

  const workspace = new WorkspaceModel({
    name,
    shortName: name.slice(0, 3),
    description: `${name} description`,
    boards,
    members: [
      {
        memberId: admin._id,
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
    ],
    admin: admin._id,
  });

  await workspace.save();
  return workspace;
}

async function seedDB() {
  try {
    await connectDB();

    // Clear existing data
    await UserModel.deleteMany({});
    await WorkspaceModel.deleteMany({});
    await BoardModel.deleteMany({});
    await ListModel.deleteMany({});
    await CardModel.deleteMany({});

    // Create users and their associated data
    const createdUsers = await Promise.all(
      users.map(async (u) => {
        const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS);
        const user = new UserModel({ ...u, password: hashedPassword });
        await user.save();

        const workspace = await createWorkspace(
          `${user.username}'s Workspace`,
          user
        );
        user.workspaces.push(workspace._id);
        await user.save();

        return user;
      })
    );

    console.log(
      "Database seeded successfully with users, workspaces, boards, lists, and cards."
    );
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    connection.close();
  }
}

seedDB();
