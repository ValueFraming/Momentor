const express = require('express');
const app = express();
const http = require('http').createServer(app);
const WebSocket = require('ws');
const url = require('url');

const wss = new WebSocket.Server({ server: http, path: "/ws" });
const activeRooms = {};

wss.on('connection', function connection(ws, req) {
  const params = url.parse(req.url, true).query;
  const room = params.room;
  const pass = params.pass;

  if (!room) {
    ws.close();
    return;
  }

  // Simple access control
  if (activeRooms[room] && activeRooms[room] !== pass) {
    ws.send("Access denied: wrong password");
    ws.close();
    return;
  }

  activeRooms[room] = pass;
  ws.send("Welcome to room: " + room);

  ws.on('message', (msg) => {
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(`[${room}]: ${msg}`);
      }
    });
  });
});

app.use(express.static('public'));
http.listen(3000, () => console.log("Server ready on :3000"));