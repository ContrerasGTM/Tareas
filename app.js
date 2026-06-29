let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [];

// =========================
// AUTH BACKEND
// =========================

let authenticated = false;

async function authenticate() {
    if (authenticated) return true;

    const pass = prompt("Ingrese la contraseña:");

    if (pass === null) return false;

    try {
        const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: pass })
        });

        const data = await res.json();

        if (data.success) {
            authenticated = true;
            return true;
        } else {
            alert("Contraseña incorrecta");
            return false;
        }

    } catch (err) {
        console.error("Error login:", err);
        alert("Error de conexión con el servidor");
        return false;
    }
}

// =========================
// FECHA
// =========================

function getDateTime() {
    const now = new Date();

    return `${String(now.getDate()).padStart(2,"0")}/${
        String(now.getMonth()+1).padStart(2,"0")}/${
        now.getFullYear()} ${
        String(now.getHours()).padStart(2,"0")}:${
        String(now.getMinutes()).padStart(2,"0")}`;
}

// =========================
// RENDER (SAFE)
// =========================

function renderTasks() {
    const pending = document.getElementById("pendingTasks");
    const progress = document.getElementById("progressTasks");
    const completed = document.getElementById("completedTasks");

    if (!pending || !progress || !completed) {
        console.error("Faltan contenedores Kanban en HTML");
        return;
    }

    pending.innerHTML = "";
    progress.innerHTML = "";
    completed.innerHTML = "";

    tasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div class="card-title">${task.title}</div>

            <div class="card-desc">${task.desc || "-"}</div>

            <div class="card-info"><b>Responsable:</b><br>${task.responsible || "-"}</div>

            <div class="card-info"><b>Creada:</b><br>${task.createdAt}</div>

            <div class="card-info"><b>Último cambio:</b><br>${task.statusUpdatedAt}</div>

            <div class="card-actions">
                <select 
                    onmousedown="storePreviousValue(this)" 
                    onchange="changeStatus(${task.id}, this.value, this)"
                >
                    <option value="pending" ${task.status==="pending"?"selected":""}>Pendiente</option>
                    <option value="progress" ${task.status==="progress"?"selected":""}>En proceso</option>
                    <option value="completed" ${task.status==="completed"?"selected":""}>Completada</option>
                </select>

                <button onclick="editTask(${task.id})">✏️</button>
                <button class="danger" onclick="deleteTask(${task.id})">🗑</button>
            </div>
        `;

        const map = {
            pending,
            progress,
            completed
        };

        map[task.status]?.appendChild(card);
    });
}

// =========================
// MODAL
// =========================

async function openModal() {
    if (!(await authenticate())) return;

    document.getElementById("taskModal").style.display = "flex";
    document.getElementById("taskId").value = "";
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDesc").value = "";
    document.getElementById("taskResponsible").value = "";
    document.getElementById("taskStatus").value = "pending";
}

function closeModal() {
    const modal = document.getElementById("taskModal");
    if (modal) modal.style.display = "none";
}

// =========================
// SAVE TASK
// =========================

async function saveTask() {
    if (!(await authenticate())) return;

    const id = document.getElementById("taskId").value;
    const title = document.getElementById("taskTitle").value;
    const desc = document.getElementById("taskDesc").value;
    const responsible = document.getElementById("taskResponsible").value;
    const status = document.getElementById("taskStatus").value;

    if (!title.trim()) {
        alert("Ingrese una tarea");
        return;
    }

    if (id) {
        const task = tasks.find(t => t.id == id);
        if (!task) return;

        const prev = task.status;

        task.title = title;
        task.desc = desc;
        task.responsible = responsible;
        task.status = status;

        if (prev !== status) {
            task.statusUpdatedAt = getDateTime();
        }

    } else {
        const now = getDateTime();

        tasks.push({
            id: Date.now(),
            title,
            desc,
            responsible,
            status,
            createdAt: now,
            statusUpdatedAt: now
        });
    }

    saveTasks();
    closeModal();
    renderTasks();
}

// =========================
// EDIT / DELETE
// =========================

async function editTask(id) {
    if (!(await authenticate())) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById("taskId").value = task.id;
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDesc").value = task.desc;
    document.getElementById("taskResponsible").value = task.responsible || "";
    document.getElementById("taskStatus").value = task.status;

    document.getElementById("taskModal").style.display = "flex";
}

async function deleteTask(id) {
    if (!(await authenticate())) return;

    if (confirm("¿Eliminar tarea?")) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
}

// =========================
// STATUS
// =========================

async function changeStatus(id, newStatus, selectElement) {

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const oldStatus = task.status;

    if (!(await authenticate())) {
        selectElement.value = oldStatus;
        return;
    }

    if (oldStatus !== newStatus) {
        task.status = newStatus;
        task.statusUpdatedAt = getDateTime();
    }

    saveTasks();
    renderTasks();
}

// =========================
// STORAGE
// =========================

function saveTasks() {
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

// =========================
// INIT SAFE
// =========================

window.addEventListener("load", () => {
    renderTasks();
});

// cerrar modal click fuera
window.onclick = function(e) {
    const modal = document.getElementById("taskModal");
    if (e.target === modal) {
        modal.style.display = "none";
    }
};

function storePreviousValue(select) {
    select.dataset.previous = select.value;
}