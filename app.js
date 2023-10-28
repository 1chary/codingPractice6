
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

// API 1 CODE:
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

// WRITING API 1
app.get("/todos/", async (request, response) => {
  let data = null;
  let getQuery = "";
  const { search_q, priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getQuery = `
            SELECT *
            FROM todo
            WHERE 
                todo LIKE '%${search_q}%'
                AND status = '${status}'
                AND priority = '${priority}'
            `;
      break;
    case hasPriorityProperty(request.query):
      getQuery = `
            SELECT *
            FROM todo
            WHERE 
                todo LIKE '%${search_q}%'
                AND priority = '${priority}
            `;
      break;
    case hasStatusProperty(request.query):
      getQuery = `
            SELECT *
            FROM todo
            WHERE 
                todo LIKE '%${search_q}%'
                AND status = '${status}'
            `;
      break;
    default:
      getQuery = `
            SELECT *
            FROM todo
            WHERE 
                todo LIKE '%${search_q}%'
            `;
      break;
  }
  data = await db.all(getQuery);
  response.send(data);
});

// API 2 :
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const withId = `
    SELECT *
    FROM todo
    WHERE id = ${todoId}
    `;
  const getDetails = await db.get(withId);
  response.send(getDetails);
});

// API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const newToDo = `
    INSERT INTO todo(id,todo,priority,status)
    VALUES(${id}, '${todo}', '${priority}' , '${status}');
    `;
  await db.run(newToDo);
  response.send("Todo Successfully Added");
});

// API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoid } = request.params;
  let updateColumn = null;
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "todo";
      break;
  }
  const access = `
  SELECT 
    *
  FROM 
    todo
  WHERE 
    id = ${todoId}
  `;
  const getDetails = await db.run(access);
  const {
    todo = getDetails.todo,
    priority = getDetails.priority,
    status = getDetails.status,
  } = request.body;

  const updateDetails = `
  UPDATE todo
  SET 
    todo = '${todo}'
    status = '${status}'
    priority = '${priority}'
    
  `;
  await db.run(updateDetails);
  response.send(`${updateColumn} Updated`);
});
// API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const delete_ = `
    DELETE FROM todo
    WHERE id = ${todoId}
    `;
  await db.run(delete_);
  response.send("Todo Deleted");
});

module.exports = app;

