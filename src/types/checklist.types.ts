export interface TodoI extends Document {
  title: string;
  isComplete: boolean;
}

export interface ChecklistI extends Document {
  name: string;
  todos: TodoI[];
}
