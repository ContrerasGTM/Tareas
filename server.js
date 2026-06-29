const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// CONFIGURACIÓN
// =========================

// La contraseña se obtiene desde Render
const PASSWORD = process.env.KANBAN_PASSWORD;

if (!PASSWORD) {
    console.error("ERROR: No se encontró la variable KANBAN_PASSWORD");
    process.exit(1);
}

app.use(express.json());

// =========================
// ARCHIVOS ESTÁTICOS
// =========================


// =========================
// LOGIN
// =========================

app.post("/login", (req, res) => {

    const { password } = req.body;

    if (password === PASSWORD) {
        return res.json({
            success: true
        });
    }

    return res.status(401).json({
        success: false
    });

});

// =========================
// RUTA PRINCIPAL
// =========================

app.get("*", (req, res) => {
    app.use(express.static(__dirname));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});
});

// =========================
// INICIAR SERVIDOR
// =========================

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});
