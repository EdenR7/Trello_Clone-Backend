import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import CardModel from "../models/card.model";
import { CustomError } from "../utils/errors/CustomError";
import UserModel from "../models/user.model";

export async function getCard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;

  try {
    const card = await CardModel.findById(cardId);
    if (!card) throw new CustomError("Card not found", 404);
    res.status(200).json(card);
  } catch (error) {
    console.log("getCard error: ");
    next(error);
  }
}

export async function updateBgCoverColor(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { color } = req.body;

  try {
    const card = await CardModel.findByIdAndUpdate(
      cardId,
      { $set: { "bgCover.bg": color } },
      { new: true, runValidators: true }
    );
    if (!card) throw new CustomError("card not found", 404);

    res.status(200).json(card);
  } catch (error) {
    console.log("updateBgCoverColor error:");
    next(error);
  }
}

export async function updateBgCoverState(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { isCover } = req.body;

  if (typeof isCover !== "boolean") {
    return next(new CustomError("isCover must be a boolean", 400));
  }

  try {
    const card = await CardModel.findByIdAndUpdate(
      cardId,
      { $set: { "bgCover.isCover": isCover } },
      { new: true, runValidators: true }
    );

    if (!card) {
      throw new CustomError("Card not found", 404);
    }

    res.status(200).json(card);
  } catch (error) {
    console.error("updateBgCoverState error:", error);
    next(error);
  }
}

export async function removeBgCover(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;

  try {
    const card = await CardModel.findByIdAndUpdate(
      cardId,
      {
        $set: { "bgCover.isCover": false, "bgCover.bg": "" },
      },
      { new: true, runValidators: true }
    );
    if (!card) {
      throw new CustomError("card not found", 404);
    }
    res.status(200).json(card);
  } catch (error) {
    console.log("removeBgCover error: ");
    next(error);
  }
}

export async function updateCardTitle(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { newTitle } = req.body;

  try {
    const card = await CardModel.findByIdAndUpdate(
      cardId,
      {
        title: newTitle,
      },
      { new: true, runValidators: true }
    );
    if (!card) {
      throw new CustomError("card not found", 404);
    }
    res.status(200).json(card);
  } catch (error) {
    console.log("editCardTitle error: ");
    next(error);
  }
}

export async function addMemberToArr(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { memberId } = req.body;

  try {
    const member = await UserModel.findById(memberId);
    if (!member) {
      throw new CustomError("Member not found", 404);
    }

    const card = await CardModel.findById(cardId);
    if (!card) {
      throw new CustomError("Card not found", 404);
    }

    const isMemberAlreadyAdded = card.members.includes(memberId);
    if (isMemberAlreadyAdded) {
      return res
        .status(400)
        .json({ message: "Member is already added to this card." });
    }

    card.members.push(memberId);
    await card.save();

    res.status(200).json(card);
  } catch (error) {
    console.log("addMemberToArr error: ", error);
    next(error);
  }
}

export async function removeMemberFromArr(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { memberId } = req.body;

  try {
    const member = await UserModel.findById(memberId);
    if (!member) {
      throw new CustomError("Memberr not found", 404);
    }

    const card = await CardModel.findById(cardId);
    if (!card) {
      throw new CustomError("Card not found", 404);
    }

    if (!card.members.includes(memberId)) {
      return res.status(400).json({ message: "Member is not in this card." });
    }

    const updatedCard = await CardModel.findByIdAndUpdate(
      cardId,
      { $pull: { members: memberId } },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedCard);
  } catch (error) {
    console.log("removeMemberFromArr error: ", error);
    next(error);
  }
}

export async function addCardDates(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { startDate, dueDate } = req.body;

  try {
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedDueDate = dueDate ? new Date(dueDate) : undefined;

    // Validate start date
    if (startDate) {
      if (!parsedStartDate || isNaN(parsedStartDate.getTime())) {
        throw new CustomError("Invalid start date format.", 400);
      }
      if (parsedStartDate.toISOString().split("T")[1] !== "00:00:00.000Z") {
        throw new CustomError("Start date should not include time.", 400);
      }
    }

    // Validate due date
    if (dueDate) {
      if (!parsedDueDate || isNaN(parsedDueDate.getTime())) {
        throw new CustomError("Invalid due date format.", 400);
      }
    }

    // Check if due date is after start date
    if (parsedStartDate && parsedDueDate && parsedDueDate < parsedStartDate) {
      throw new CustomError("Due date must be after the start date.", 400);
    }

    const card = await CardModel.findById(cardId);
    if (!card) {
      throw new CustomError("Card not found", 404);
    }

    card.startDate = parsedStartDate;
    card.dueDate = parsedDueDate;
    await card.save();

    res.status(200).json(card);
  } catch (error) {
    console.error("addCardDates error: ", error);
    next(error);
  }
}

export async function addChecklistToArr(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { checklistName } = req.body;
  try {
    const card = await CardModel.findByIdAndUpdate(
      cardId,
      {
        $push: { checklist: { name: checklistName, todos: [] } },
      },
      { new: true, runValidators: true }
    );
    if (!card) {
      throw new CustomError("Card not found", 404);
    }
    res.status(200).json(card);
  } catch (error) {
    console.log("addChecklist error: ", error);
    next(error);
  }
}

export async function removeChecklistFromArr(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { checklistId } = req.body;
  try {
    const card = await CardModel.findByIdAndUpdate(
      cardId,
      {
        $pull: { checklist: { _id: checklistId } },
      },
      { new: true, runValidators: true }
    );
    if (!card) {
      throw new CustomError("Card not found", 404);
    }
    res.status(200).json(card);
  } catch (error) {
    console.log("addChecklist error: ", error);
    next(error);
  }
}

export async function addTodoToArr(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { checklistId, todoTitle } = req.body;
  try {
    const card = await CardModel.findOneAndUpdate(
      { _id: cardId, "checklist._id": checklistId },
      {
        $push: { "checklist.$.todos": { title: todoTitle, isComplete: false } },
      },
      { new: true, runValidators: true }
    );
    if (!card) {
      throw new CustomError("Card not found", 404);
    }
    res.status(200).json(card);
  } catch (error) {
    console.log("addTodo error: ", error);
    next(error);
  }
}

export async function removeTodoFromArr(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;

  const { checklistId, todoId } = req.body;
  try {
    const card = await CardModel.findOneAndUpdate(
      { _id: cardId, "checklist._id": checklistId },
      { $pull: { "checklist.$.todos": { _id: todoId } } },
      { new: true, runValidators: true }
    );
    if (!card) {
      throw new CustomError("Card not found", 404);
    }
    res.status(200).json(card);
  } catch (error) {
    console.log("addTodo error: ", error);
    next(error);
  }
}

export async function updateTodoTitle(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { checklistId, todoId, newTodoTitle } = req.body;

  if (!checklistId || !todoId || !newTodoTitle) {
    return next(
      new CustomError("checklistId, todoId, and newTodoTitle are required", 400)
    );
  }
  try {
    const card = await CardModel.findOneAndUpdate(
      {
        _id: cardId,
        "checklist._id": checklistId,
        "checklist.todos._id": todoId,
      },
      {
        $set: {
          "checklist.$[chk].todos.$[td].title": newTodoTitle,
        },
      },
      {
        new: true,
        runValidators: true,
        arrayFilters: [{ "chk._id": checklistId }, { "td._id": todoId }],
      }
    );
    if (!card) {
      throw new CustomError("Card not found", 404);
    }
    res.status(200).json(card);
  } catch (error) {
    console.log("addTodo error: ", error);
    next(error);
  }
}

export async function toggleTodoComplete(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { checklistId, todoId } = req.body;

  if (!checklistId || !todoId) {
    return next(new CustomError("checklistId and todoId are required", 400));
  }

  try {
    const card = await CardModel.findOne({ _id: cardId });
    if (!card) {
      throw new CustomError("Card not found", 404);
    }

    const checklist = card.checklist.find(
      (cl) => cl._id.toString() === checklistId
    );
    if (!checklist) {
      throw new CustomError("Checklist not found", 404);
    }

    const todoIndex = checklist.todos.findIndex(
      (todo) => todo._id.toString() === todoId
    );
    if (todoIndex === -1) {
      throw new CustomError("Todo not found", 404);
    }

    // Toggle the isComplete status
    checklist.todos[todoIndex].isComplete =
      !checklist.todos[todoIndex].isComplete;

    await card.save();

    res.status(200).json(card);
  } catch (error) {
    console.error("toggleTodoComplete error: ", error);
    next(error);
  }
}

export async function addLabelToCard( req: AuthRequest,
  res: Response,
  next: NextFunction){
    const {cardId} = req.params
    const {labelId} = req.body
    try {
      const card = await CardModel.findByIdAndUpdate(cardId, {$push: {"card.labels": labelId}}, {new: true, runValidators: true})
      if(!card){
        throw new CustomError("Card not found", 404);
      }
      res.status(200).json(card)
    } catch (error) {
      console.log("addTodo error: ", error);
    next(error);
    }
  }