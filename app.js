Archivo recibido. La migración completa requiere reescribir el flujo async.

let tasks =
JSON.parse(localStorage.getItem("kanbanTasks")) || [];

// =========================
// AUTENTICACIÓN
// =========================

const PASSWORD = "3261"; // Cambia aquí la contraseña

let authenticated = false;

function authenticate(){

if(authenticated) return true;

let pass = prompt("Ingrese la contraseña:");

if(pass === null) {
    // Canceló el prompt → NO bloquear sistema
    return false;
}

if(pass === PASSWORD){

authenticated = true;
return true;

}

alert("Contraseña incorrecta.");

return false;

}

// =========================
// FECHAS
// =========================

function getDateTime(){

let now=new Date();

let day=String(now.getDate()).padStart(2,"0");
let month=String(now.getMonth()+1).padStart(2,"0");
let year=now.getFullYear();

let hour=String(now.getHours()).padStart(2,"0");
let minute=String(now.getMinutes()).padStart(2,"0");

return `${day}/${month}/${year} ${hour}:${minute}`;

}

// asegurar render cuando carga la página
window.addEventListener("load",renderTasks);

// =========================
// RENDER
// =========================

function renderTasks(){

document.getElementById("pendingTasks").innerHTML="";
document.getElementById("progressTasks").innerHTML="";
document.getElementById("completedTasks").innerHTML="";

tasks.forEach(task=>{

let card=document.createElement("div");

card.className="card";

card.innerHTML=`

<div class="card-title">

${task.title}

</div>

<div class="card-desc">

${task.desc || "-"}

</div>

<div class="card-info">

<b>Responsable:</b><br>

${task.responsible || "-"}

</div>

<div class="card-info">

<b>Creada:</b><br>

${task.createdAt}

</div>

<div class="card-info">

<b>Último cambio:</b><br>

${task.statusUpdatedAt}

</div>

<div class="card-actions">

<select onchange="changeStatus(${task.id},this.value)">

<option value="pending" ${task.status==="pending"?"selected":""}>Pendiente</option>

<option value="progress" ${task.status==="progress"?"selected":""}>En proceso</option>

<option value="completed" ${task.status==="completed"?"selected":""}>Completada</option>

</select>

<button onclick="editTask(${task.id})">

✏️

</button>

<button
class="danger"
onclick="deleteTask(${task.id})">

🗑

</button>

</div>

`;

if(task.status==="pending"){

document.getElementById("pendingTasks").appendChild(card);

}

if(task.status==="progress"){

document.getElementById("progressTasks").appendChild(card);

}

if(task.status==="completed"){

document.getElementById("completedTasks").appendChild(card);

}

});

}

function openModal(){

if(!authenticate()) return;

document.getElementById("taskModal").style.display="flex";

document.getElementById("taskId").value="";
document.getElementById("taskTitle").value="";
document.getElementById("taskDesc").value="";
document.getElementById("taskResponsible").value="";
document.getElementById("taskStatus").value="pending";

}

function closeModal(){

document.getElementById("taskModal").style.display="none";

}

function saveTask(){

if(!authenticate()) return;

let id=document.getElementById("taskId").value;

let title=document.getElementById("taskTitle").value;

let desc=document.getElementById("taskDesc").value;

let responsible=document.getElementById("taskResponsible").value;

let status=document.getElementById("taskStatus").value;

if(title.trim()===""){

alert("Ingrese una tarea");

return;

}

if(id){

let task=tasks.find(t=>t.id==id);

// Guardar el estado anterior
let previousStatus=task.status;

task.title=title;
task.desc=desc;
task.responsible=responsible;

// Solo actualizar la fecha si cambió el estado
if(previousStatus!==status){

task.status=status;
task.statusUpdatedAt=getDateTime();

}else{

task.status=status;

}

}else{

let now=getDateTime();

tasks.push({

id:Date.now(),

title,

desc,

responsible,

status,

createdAt:now,

statusUpdatedAt:now

});

}

saveTasks();

closeModal();

renderTasks();

}

function editTask(id){

if(!authenticate()) return;

let task=tasks.find(t=>t.id===id);

document.getElementById("taskId").value=task.id;

document.getElementById("taskTitle").value=task.title;

document.getElementById("taskDesc").value=task.desc;

document.getElementById("taskResponsible").value=task.responsible || "";

document.getElementById("taskStatus").value=task.status;

document.getElementById("taskModal").style.display="flex";

}

function deleteTask(id){

if(!authenticate()) return;

if(confirm("¿Eliminar tarea?")){

tasks=tasks.filter(t=>t.id!==id);

saveTasks();

renderTasks();

}

}

function changeStatus(id,status){

if(!authenticate()) return;

let task=tasks.find(t=>t.id===id);

let previousStatus=task.status;

// Solo si realmente cambia el estado
if(previousStatus!==status){

task.status=status;
task.statusUpdatedAt=getDateTime();

}else{

task.status=status;

}

saveTasks();

renderTasks();

}

// =========================
// LOCAL STORAGE
// =========================

function saveTasks(){

localStorage.setItem(
"kanbanTasks",
JSON.stringify(tasks)
);

}

// Cerrar modal al hacer clic fuera
window.onclick=function(e){

if(e.target.id==="taskModal"){

document.getElementById("taskModal").style.display="none";

}

}