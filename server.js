const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = {};  // Uchovávání uživatelů

app.use(express.static("public"));
// Pokud nemáte další routy, můžete přidat základní routu
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');  // Tento soubor bude zobrazen při návštěvě "/"
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
io.on("connection", (socket) => {
    console.log("Uživatel připojen:", socket.id);

    // Nastavení jména uživatele
    socket.on("set username", (username) => {
        users[socket.id] = username;
        console.log(`Uživatel ${username} připojen`);
    });

    // Posílání zprávy
    socket.on("chat message", (data) => {
        const senderUsername = users[socket.id];

        // Pošleme zprávu zpět uživateli, který ji napsal
        io.to(socket.id).emit("chat message", {
            username: senderUsername,
            text: data.text,
            targetUsername: senderUsername
        });

        // Pokud je zpráva určena konkrétnímu uživateli (ne Draukoo)
        if (data.targetUsername && data.targetUsername !== "Draukoo") {
            const targetUserId = Object.keys(users).find(id => users[id] === data.targetUsername);
            if (targetUserId) {
                io.to(targetUserId).emit("chat message", {
                    username: senderUsername,
                    text: data.text,
                    targetUsername: data.targetUsername
                });
            }
        }

        // Pokud zpráva je určena Draukoo
        else if (data.targetUsername === "Draukoo") {
            const targetUserId = Object.keys(users).find(id => users[id] === "Draukoo");
            if (targetUserId) {
                io.to(targetUserId).emit("chat message", {
                    username: senderUsername,
                    text: data.text,
                    targetUsername: "Draukoo"
                });
            }
        }

        // Pokud je zpráva pro všechny
        else if (senderUsername === "Draukoo") {
            Object.keys(users).forEach((id) => {
                if (users[id] !== "Draukoo") {
                    io.to(id).emit("chat message", {
                        username: senderUsername,
                        text: data.text,
                        targetUsername: "Draukoo"
                    });
                }
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("Uživatel odpojen:", socket.id);
        delete users[socket.id];
    });
});

server.listen(3000, () => {
    console.log("Server běží na http://localhost:3000");
});
