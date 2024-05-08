const express = require("express");
const { createServer } = require("node:http");
const { mysql } = require("./db/connection");
const { Server } = require("socket.io");
const cors = require("cors");
const {
  corsConfig,
  sessionMiddleware,
  wrap,
  authSocketMiddleware,
} = require("./middleware/auth");
const helmet = require("helmet");
const passport = require("passport");

const chat = require("./services/chat");

const producer = require("./base/producer");
const consumer = require("./base/consumer");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: corsConfig,
  cookie: true,
});

const Auth = require("./routes/auth");
const User = require("./routes/user");
const Chat = require("./routes/chat");

mysql
  .initialize()
  .then(async () => {
    app.get("/health", (req, res) => {
      res.send("Working!");
    });

    app.use(helmet());
    app.use(cors(corsConfig));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(sessionMiddleware);
    app.use(passport.authenticate("session"));

    await chat.initialize();

    await producer.startProducer();
    await consumer.startConsumer("receive-chat-group");

    app.use("/auth", Auth);
    app.use("/user", User);
    app.use("/chat", Chat);

    io.use(wrap(sessionMiddleware));
    io.use(authSocketMiddleware);

    io.on("connection", socket => {
      console.log("a user connected ", socket.id);

      socket.join(socket.id);

      socket.on("disconnect", () => {
        console.log("user disconnected ", socket.id);
      });

      socket.on("send-chat", async arg => {
        await producer.sendMsg("send-chat-topic", [
          {
            value: JSON.stringify(arg),
          },
        ]);
      });
    });

    await consumer.subscribeConsumer(
      "receive-chat-topic",
      ({ topic, partition, message }) => {
        if (message.value) {
          const args = JSON.parse(message.value.toString());
          args?.users?.forEach(rec => {
            if (rec?.id) {
              io.to(rec.id).emit("receive-chat", args);
            }
          });
        }
      }
    );

    server.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  })
  .catch(error => {
    console.log(error);
  });
