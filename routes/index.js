import express from "express";
import http from 'http';
import bodyParser from "body-parser";
import { v4 as uuidv4 } from 'uuid';


import * as Controller from "../controller/index.js";
const API_PORT = process.env.PORT || 3002;
const app = express();
const server = http.createServer(app);
import cors from "cors";
app.use(
  cors({
    origin: process.env.CORS_PERMISSION_SEVER,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
const router = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(router)


// socket connection 

import { Server } from "socket.io";

const io = new Server(server, {
    cors: {
      origin: '*', // change this in prod!
      methods: ['GET', 'POST']
    },
  });

  const activeSessions = new Map();
  
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);
  
    socket.on("start-chat", ({ topic, bot1, bot2 }) => {
      const sessionId = uuidv4();
      activeSessions.set(socket.id, sessionId);
  
      const context = {
        turn: 0,
        maxTurns: 100,
        lastMessage: topic.toLowerCase(),
        current: "bot1",
        bots: { bot1, bot2 },
        sessionId,
      };
  
      handleBotTurn(socket, context);
    });


    socket.on('end-chat', () => {
      console.log('⛔ Chat ended manually by user:', socket.id);
      activeSessions.delete(socket.id); 
    });
  
    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
      activeSessions.delete(socket.id);
    });
  });
  
  async function handleBotTurn(socket, ctx) {
    const { current, bots, lastMessage, turn, maxTurns, sessionId } = ctx;
  
    if (turn >= maxTurns || !socket.connected) return;
  
    // ❌ Stop if session is outdated
    if (activeSessions.get(socket.id) !== sessionId) {
      console.log(`🛑 Session mismatch: skipping loop for ${socket.id}`);
      return;
    }
  
    const model = bots[current];
    const next = current === "bot1" ? "bot2" : "bot1";
  
    socket.emit(`${current}-typing`);
    await new Promise((res) => setTimeout(res, 1000));
  
    const reply = await Controller.simulator.getLLMResponse(model, lastMessage);
    console.log(`🤖 ${current}: ${reply}`);
  
    if (!socket.connected || activeSessions.get(socket.id) !== sessionId) return;
  
    socket.emit(current, {
      model,
      message: reply,
    });
  
    ctx.lastMessage = reply;
    ctx.turn++;
    ctx.current = next;
  
    setTimeout(() => handleBotTurn(socket, ctx), 800);
  }
  





router.get("/api/test", Controller.simulator.test);




const init = async function () {
    server.listen(API_PORT, () =>
        console.log(`✅ LISTENING ON PORT ${API_PORT} WITH SOCKET.IO`)
      );
  }

export{
    init
  };    
  