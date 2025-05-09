const express = require("express");
const barterRoutes = require("./routes/barterRoutes");
const app = express();
const PORT = 5001;

app.use("/api/barter", barterRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
