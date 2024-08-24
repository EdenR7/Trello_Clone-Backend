import app, { main } from "./app";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 3000;

main();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
