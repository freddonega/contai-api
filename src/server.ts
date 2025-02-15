import app from "./index";
import { setupSwagger } from "./swagger";

const PORT = process.env.PORT || 3000;

setupSwagger(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
