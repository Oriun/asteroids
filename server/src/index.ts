import Express from "express";
// import Routes from "./routes";
import upgrade from "./websocket";
import shortid from "shortid";
import Cors from "cors";

// remove - char because it's breaking natural dblClick selection
shortid.characters(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_£"
);

const App = Express();

App.use(Cors());
App.use(Express.json());
// App.use("/api", Routes);

App.listen(5000, () => {
  console.log("Server running");
}).on("upgrade", upgrade);
