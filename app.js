const dateFins = require("date-fns");
const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

app.use(express.json());

const db = path.join(__dirname, "todoApplication.db");

let database = null;

const initializeTheDataBase = async () => {
  try {
    database = await open({
      filename: db,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB:ERROR ${e.message}`);
    process.exit(1);
  }
};

initializeTheDataBase();
