import { ClientSession } from "mongoose";
import { UserI } from "../types/user.types";
import { createLabels } from "../utils/boardUtilFuncs";
import { CustomError } from "../utils/errors/CustomError";
import { LabelI } from "../types/label.types";
import BoardModel from "../models/board.model";
import ListModel from "../models/list.model";
import CardModel from "../models/card.model";

export async function generateCodingBoard(
  session: ClientSession,
  newUser: UserI
) {
  try {
    // generate coding board
    const codingLabelsDefinitions = [
      { title: "Bug", color: "#ca3521" },
      { title: "Deployment", color: "#f8e6a0" },
      { title: "Devops task", color: "#e2b203" },
      { title: "Feature", color: "#cce0ff" },
      { title: "Research", color: "#fdd0ec" },
      { title: "UI/UX", color: "#1d7f8c" },
      { title: "Testing", color: "#60c6d2" },
    ];
    const codingLabels = await createLabels(codingLabelsDefinitions);
    if (!codingLabels || codingLabels.length === 0)
      throw new CustomError("Labels not found", 404);
    const defaultLabelsIds = codingLabels.map((label: LabelI) => label._id);

    const codingBoard = new BoardModel({
      admin: newUser._id,
      name: "Project Proccess",
      bg: { background: "#0079BF", bgType: "color" }, // Example background color
      labels: [...defaultLabelsIds],
      members: [newUser._id],
      listsNumber: 0,
      // listsNumber: 4,
    });
    await codingBoard.save({ session });

    // backlog list
    const BacklogList = new ListModel({
      name: "Backlog",
      position: 1,
      cards: [],
      board: codingBoard._id,
    });

    const BacklogListCard1 = new CardModel({
      admin: newUser._id,
      title: "Implement user authentication",
      position: 1,
      list: BacklogList._id,
      checklist: [
        {
          name: "To Do",
          todos: [
            {
              title: "Design Login UI",
              isComplete: false,
            },
            {
              title: "Set up authentication API",
              isComplete: false,
            },
            {
              title: "Test login functionality",
              isComplete: false,
            },
          ],
        },
      ],
      bgCover: {
        isCover: false, //instead of adding bgCoverState, may change
        bg: "#4bce97",
      },
      members: [],
      labels: [codingLabels.find((label) => label.title === "Feature")?._id],
    });
    await BacklogListCard1.save({ session });
    const BacklogListCard2 = new CardModel({
      admin: newUser._id,
      title: "Research payment gateway integration",
      position: 2,
      list: BacklogList._id,
      checklist: [],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
      members: [],
      bgCover: {
        isCover: false,
        bg: "#f5cd47",
      },
      labels: [codingLabels.find((label) => label.title === "Research")?._id],
    });
    await BacklogListCard2.save({ session });

    BacklogList.cards.push(BacklogListCard1._id as any);
    BacklogList.cards.push(BacklogListCard2._id as any);
    await BacklogList.save({ session });

    // inProgress list
    const inProgressList = new ListModel({
      name: "In Progress",
      position: 2,
      cards: [],
      board: codingBoard._id,
    });

    const inProgressListCard1 = new CardModel({
      admin: newUser._id,
      title: "Refactor dashboard UI",
      position: 1,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      list: inProgressList._id,
      checklist: [
        {
          name: "To Do",
          todos: [
            {
              title: "Update dashboard layout",
              isComplete: false,
            },
            {
              title: "Improve responsiveness",
              isComplete: false,
            },
          ],
        },
      ],
      bgCover: {
        isCover: false, //instead of adding bgCoverState, may change
        bg: "#9f8fef",
      },
      members: [],
      labels: [codingLabels.find((label) => label.title === "UI/UX")?._id],
    });
    await inProgressListCard1.save({ session });
    const inProgressListCard2 = new CardModel({
      admin: newUser._id,
      title: "Fix issue with user roles management",
      position: 2,
      list: inProgressList._id,
      checklist: [],
      dueDate: new Date(),
      members: [],
      bgCover: {
        isCover: true,
        bg: "#f87168",
      },
      labels: [codingLabels.find((label) => label.title === "Bug")?._id],
    });
    await inProgressListCard2.save({ session });

    inProgressList.cards.push(inProgressListCard1._id as any);
    inProgressList.cards.push(inProgressListCard2._id as any);
    await inProgressList.save({ session });

    // Review list
    const reviewList = new ListModel({
      name: "Review",
      position: 3,
      cards: [],
      board: codingBoard._id,
    });

    const reviewListCard = new CardModel({
      admin: newUser._id,
      title: "Add unit tests for payment module",
      position: 1,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      list: reviewList._id,
      checklist: [
        {
          name: "To Do",
          todos: [
            {
              title: "Write unit tests for payment flow",
              isComplete: true,
            },
            {
              title: "Ensure all tests pass",
              isComplete: true,
            },
          ],
        },
      ],
      bgCover: {
        isCover: false, //instead of adding bgCoverState, may change
        bg: "#579dff",
      },
      members: [],
      labels: [codingLabels.find((label) => label.title === "Testing")?._id],
    });
    await reviewListCard.save({ session });

    reviewList.cards.push(reviewListCard._id as any);
    await reviewList.save({ session });

    //Done list
    const doneList = new ListModel({
      name: "Done",
      position: 4,
      cards: [],
      board: codingBoard._id,
    });

    const doneListCard1 = new CardModel({
      admin: newUser._id,
      title: "Redesign homepage",
      position: 1,
      list: doneList._id,
      checklist: [
        {
          name: "To Do",
          todos: [
            {
              title: "Update hero section",
              isComplete: true,
            },
            {
              title: "Improve load speed",
              isComplete: true,
            },
          ],
        },
      ],
      bgCover: {
        isCover: true,
        bg: "#9f8fef",
      },
      members: [],
      labels: [codingLabels.find((label) => label.title === "UI/UX")?._id],
    });
    await doneListCard1.save({ session });

    const doneListCard2 = new CardModel({
      admin: newUser._id,
      title: "Deploy new user profile feature",
      position: 2,
      list: doneList._id,
      checklist: [
        {
          name: "To Do",
          todos: [
            {
              title: "Final testing",
              isComplete: true,
            },
            {
              title: "Deploy to staging",
              isComplete: true,
            },
            {
              title: "Notify team after deployment",
              isComplete: true,
            },
          ],
        },
      ],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      members: [],
      bgCover: {
        isCover: true,
        bg: "#f5cd47",
      },
      labels: [codingLabels.find((label) => label.title === "Feature")?._id],
    });
    await doneListCard2.save({ session });

    doneList.cards.push(doneListCard1._id as any);
    doneList.cards.push(doneListCard2._id as any);
    await doneList.save({ session });

    return codingBoard;
  } catch (error) {
    throw new CustomError("Error generating coding board", 500);
  }
}
