const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 🔴 ESTO ES CLAVE
app.use(express.static(__dirname));

// HOME
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// LOGIN
app.post("/login", (req, res) => {
    const password = req.body.password;

    if (process.env.KANBAN_PASSWORD && password === process.env.KANBAN_PASSWORD) {
        return res.json({ success: true });
    }

    return res.status(401).json({ success: false });
});

// START SERVER
app.listen(PORT, () => {
    console.log("Server running on port", PORT);
    console.log("Files path:", __dirname);
});
