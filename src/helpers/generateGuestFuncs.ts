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
      bg: {
        background:
          "https://images.unsplash.com/photo-1724589613596-e269be5c0849?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        bgType: "image",
      }, // Example background color
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

export async function generateDailyTasksBoard(
  session: ClientSession,
  newUser: UserI
) {
  try {
    // Define labels for the daily tasks board
    const dailyLabelsDefinitions = [
      { title: "Urgent", color: "#ca3521" },
      { title: "Work", color: "#0052cc" },
      { title: "Personal", color: "#4c9f70" },
      { title: "Chores", color: "#f5cd47" },
      { title: "Health", color: "#d36fd5" },
      { title: "Family", color: "#f39237" },
      { title: "Wellness", color: "#ff947f" },
    ];
    const dailyLabels = await createLabels(dailyLabelsDefinitions);
    if (!dailyLabels || dailyLabels.length === 0)
      throw new CustomError("Labels not found", 404);
    const defaultLabelsIds = dailyLabels.map((label: LabelI) => label._id);

    // Create the daily tasks board
    const dailyTasksBoard = new BoardModel({
      admin: newUser._id,
      name: "Daily Tasks",
      bg: {
        background:
          "linear-gradient(to bottom right, #1F845A 2%, #60C6D2 100%)",
        bgType: "gradient",
      },
      labels: [...defaultLabelsIds],
      members: [newUser._id],
      listsNumber: 0,
    });
    await dailyTasksBoard.save({ session });

    // Define lists and cards for the board
    const listsAndCards = [
      {
        name: "Morning Routine",
        position: 1,
        cards: [
          {
            title: "Wake up and stretch",
            position: 1,
            labels: [
              dailyLabels.find((label) => label.title === "Health")?._id,
            ],
          },
          {
            title: "Exercise (15 mins)",
            position: 2,
            checklist: [
              {
                name: "Exercise",
                todos: [
                  { title: "Warm-up", isComplete: false },
                  { title: "Workout", isComplete: false },
                ],
              },
            ],
            labels: [
              dailyLabels.find((label) => label.title === "Health")?._id,
            ],
          },
          {
            title: "Plan day’s priorities",
            position: 3,
            labels: [
              dailyLabels.find((label) => label.title === "Personal")?._id,
            ],
          },
        ],
      },
      {
        name: "Work Tasks",
        position: 2,
        cards: [
          {
            title: "Finish project report",
            position: 1,
            checklist: [
              {
                name: "Report Tasks",
                todos: [
                  { title: "Draft outline", isComplete: false },
                  { title: "Proofread", isComplete: false },
                ],
              },
            ],
            labels: [dailyLabels.find((label) => label.title === "Work")?._id],
          },
          {
            title: "Emails and follow-ups",
            position: 2,
            labels: [dailyLabels.find((label) => label.title === "Work")?._id],
          },
          {
            title: "Team meeting prep",
            position: 3,
            checklist: [
              {
                name: "Meeting Preparation",
                todos: [
                  { title: "Review notes", isComplete: false },
                  { title: "Prepare agenda", isComplete: false },
                ],
              },
            ],
            labels: [
              dailyLabels.find((label) => label.title === "Work")?._id,
              dailyLabels.find((label) => label.title === "Urgent")?._id,
            ],
            dueDate: new Date(new Date().setHours(9, 0, 0)),
          },
          {
            title: "Research project ideas",
            position: 4,
            labels: [
              dailyLabels.find((label) => label.title === "Personal")?._id,
            ],
          },
        ],
      },
      {
        name: "Family Tasks",
        position: 3,
        cards: [
          {
            title: "Prepare breakfast for family",
            position: 1,
            checklist: [
              {
                name: "Breakfast prep",
                todos: [
                  { title: "Make coffee", isComplete: false },
                  { title: "Prepare oatmeal", isComplete: false },
                ],
              },
            ],
            labels: [
              dailyLabels.find((label) => label.title === "Chores")?._id,
              dailyLabels.find((label) => label.title === "Family")?._id,
            ],
          },
          {
            title: "Get kids ready for school",
            position: 2,
            labels: [
              dailyLabels.find((label) => label.title === "Family")?._id,
            ],
          },
          {
            title: "Family dinner",
            position: 3,
            checklist: [
              {
                name: "Dinner Tasks",
                todos: [
                  { title: "Prepare meal", isComplete: false },
                  { title: "Set table", isComplete: false },
                ],
              },
            ],
            labels: [
              dailyLabels.find((label) => label.title === "Family")?._id,
              dailyLabels.find((label) => label.title === "Chores")?._id,
            ],
          },
        ],
      },
    ];

    // Create lists and cards within the session
    for (const listData of listsAndCards) {
      const newList = new ListModel({
        name: listData.name,
        position: listData.position,
        cards: [],
        board: dailyTasksBoard._id,
      });
      await newList.save({ session });

      for (const cardData of listData.cards) {
        const newCard = new CardModel({
          admin: newUser._id,
          title: cardData.title,
          position: cardData.position,
          list: newList._id,
          checklist: cardData.checklist || [],
          bgCover: { isCover: false, bg: "#ffffff" },
          labels: cardData.labels || [],
          dueDate: cardData.dueDate || null,
          members: [],
        });
        await newCard.save({ session });
        newList.cards.push(newCard._id as any);
      }
      await newList.save({ session });
    }

    return dailyTasksBoard;
  } catch (error) {
    throw new CustomError("Error generating daily tasks board", 500);
  }
}
