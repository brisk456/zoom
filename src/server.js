import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

function publicRooms() {
    const { sockets: { adapter: { sids, rooms }, }, } = wsServer;

    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });

    return publicRooms;
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", socket => {
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });

    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });

    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });

    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });
});


// import express from "express";
// import { Server } from "socket.io";
// import { instrument } from "@socket.io/admin-ui";
// import http from "http";

// const app = express();

// app.set("view engine", "pug");
// app.set("views", __dirname + "/views");
// app.use("/public", express.static(__dirname + "/public"));
// app.get("/", (req, res) => res.render("home"));
// app.get("/*", (req, res) => res.redirect("/"));

// const handleListen = () => console.log(`Listening on http://localhost:3000`);

// const httpServer = http.createServer(app);
// const wsServer = new Server(httpServer, {
//     cors: {
//       origin: ["https://admin.socket.io"],
//       credentials: true
//     }
//   });
  
//   instrument(wsServer, {
//     auth: false
//   });

// wsServer.on("connection", socket => {
//     socket["nickname"] = "anon";

//     socket.onAny((event) => {
//         console.log(`Socket Event: ${event}`);
//     });
    
//     socket.on("enter_room", (roomName, done) => {
//         socket.join(roomName.payload);
//         done();
//         socket.to(roomName.payload).emit("welcome", socket.nickname, countRoom(roomName.payload));
//         wsServer.sockets.emit("room_change", publicRooms());
//     });

//     socket.on("disconnecting", () => {
//         socket.rooms.forEach((room) => {
//             socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
//         });
//     });

//     socket.on("disconnect", () => {
//         wsServer.sockets.emit("room_change", publicRooms());
//     });

//     socket.on("new_message", (msg, room, done) => {
//         socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
//         done();
//     });

//     socket.on("nickname", (nickname) => {
//         socket["nickname"] = nickname;
//     });
// });

httpServer.listen(3000, handleListen);