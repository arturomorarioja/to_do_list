/**
 * To Do List - JavaScript functionality
 * 
 * @author  Arturo Mora-Rioja (amri@kea.dk)
 * @version 1.0 June 2020
 */
const ADDTASKTEXT = "Add";
const UPDATETASKTEXT = "Update";

// These variables will be updated every time a task is added, edited, deleted, or if it switches lists.
// They will be checked in the function resizeLists()
let toDoListHeight = document.getElementById("toDoList").offsetHeight;
let ongoingListHeight = 0;
let doneListHeight = 0;

// Value initialization on page load
document.addEventListener("DOMContentLoaded", function() {    
    document.getElementById("currentTask").setAttribute("currentid", "");   // ID of the task being edited
    document.getElementById("currentTask").setAttribute("lastid", "0");     // Highest task ID
});

// Edit a new task
document.getElementById("addTask").addEventListener("click", function() {
    const CURRENTTASK = document.getElementById("currentTask");
    const NEWID = parseInt(CURRENTTASK.getAttribute("lastid")) + 1;

    document.getElementById("txtTask").value = "";
    document.getElementById("btnOk").value = ADDTASKTEXT;
    CURRENTTASK.setAttribute("currentid", NEWID);
    CURRENTTASK.style.display = "block";
    document.getElementById("txtTask").focus();
});

// Edit an existing task
const taskClick = function() {
    const CURRENTTASK = document.getElementById("currentTask");
    const ID = parseInt(this.getAttribute("taskId"));
    
    document.getElementById("btnOk").value = UPDATETASKTEXT;
    document.getElementById("txtTask").value = this.innerText;
    CURRENTTASK.setAttribute("currentid", ID);
    CURRENTTASK.style.display = "block";
    document.getElementById("txtTask").focus();
}

// Delete a task
const deleteButtonClick = function(e) {
    e.stopPropagation();
    const TASKHEIGHT = this.parentElement.offsetHeight + 10;
    const CURRENTLISTNAME = this.parentElement.parentElement.id;

    this.parentElement.remove();

    // List height is recalculated
    switch (CURRENTLISTNAME) {
        case "toDoList":
            toDoListHeight -= TASKHEIGHT;
            break;
        case "ongoingList":
            ongoingListHeight -= TASKHEIGHT;
            break;
        case "doneList":
            doneListHeight -= TASKHEIGHT;
    }
    resizeLists();
}

// Add or update a task
document.getElementById("btnOk").addEventListener("click", function() {
    const TASKTEXT = document.getElementById("txtTask");
    const CURRENTTASK = document.getElementById("currentTask");
    
    if (TASKTEXT.value.trim() === "") {
        alert("Please insert some text");
        TASKTEXT.focus();
        return false;
    }

    if (this.value === ADDTASKTEXT) {       // Add a to do task
        
        // Create the task div
        const task = document.createElement("div");

        task.classList.add("task");
        task.classList.add("toDo");
        task.innerText = TASKTEXT.value;
        task.setAttribute("taskId", CURRENTTASK.getAttribute("currentid"));
        CURRENTTASK.setAttribute("lastid", parseInt(CURRENTTASK.getAttribute("lastid")) + 1);
        task.addEventListener("click", taskClick);
        task.setAttribute("draggable", "true");
        task.addEventListener("dragstart", dragStart);
        task.prepend(deleteButton());

        // Add to the to do list
        const toDoList = document.getElementById("toDoList");
        toDoList.prepend(task);

        // Recalculate list height
        toDoListHeight += (task.offsetHeight + 10);

    } else {                                // Update task
        // Update the task div
        const task = document.querySelector("div.task[taskid='" + CURRENTTASK.getAttribute("currentid") + "']");
        const PREVIOUSHEIGHT = task.offsetHeight;
        const CURRENTLISTNAME = task.parentNode.id;

        task.innerText = TASKTEXT.value;
        task.prepend(deleteButton());
        
        // Recalculate list height
        switch (CURRENTLISTNAME) {
            case "toDoList":
                toDoListHeight = toDoListHeight - PREVIOUSHEIGHT + task.offsetHeight;
                break;                
            case "ongoingList":
                ongoingListHeight = ongoingListHeight - PREVIOUSHEIGHT + task.offsetHeight;
                break;                
            case "doneList":
                doneListHeight = doneListHeight - PREVIOUSHEIGHT + task.offsetHeight;
        }
    }
    resizeLists();
    
    // Clear and hide the modal
    TASKTEXT.value = "";
    CURRENTTASK.style.display = "none";
});

// Cancel task edition
function cancelTaskEdition() {
    const CURRENTTASK = document.getElementById("currentTask");
    
    CURRENTTASK.setAttribute("currentid", "0");
    CURRENTTASK.style.display = "none";
}
document.getElementById("btnCancel").addEventListener("click", function() {
    cancelTaskEdition();
});
document.getElementById("txtTask").addEventListener("keyup", function(e) {
    if (e.code === "Escape") {
        cancelTaskEdition();
    }
});

// Show help
document.getElementById("showHelp").addEventListener("click", function() {
    document.getElementById("help").style.display = "block";
    document.getElementById("btnClose").focus();
});

// Close help
function hideHelp() {
    document.getElementById("help").style.display = "none";
}
document.getElementById("btnClose").addEventListener("click", function() {
    hideHelp();
});
document.getElementById("btnClose").addEventListener("keyup", function(e) {
    if (e.code === "Escape") {
        hideHelp();
    }
});

/*
    Drag and drop functionality
*/
dragStart = function(e) {
    e.dataTransfer.setData("text/plain", null);
    draggedTask = e.target;
}

document.getElementById("toDoList").addEventListener("dragover", function(e) {
    e.preventDefault();
});
document.getElementById("ongoingList").addEventListener("dragover", function(e) {
    e.preventDefault();
});
document.getElementById("doneList").addEventListener("dragover", function(e) {
    e.preventDefault();
});

// Drop a task on the to do list
document.getElementById("toDoList").addEventListener("drop", function() {
    dropTask("toDo", this);
        
    // Move the add task button to the end
    const addTask = document.getElementById("addTask");
    toDoList.removeChild(addTask);
    toDoList.appendChild(addTask);        
});

// Drop a task on the ongoing list
document.getElementById("ongoingList").addEventListener("drop", function() {
    dropTask("ongoing", this);
});

// Drop a task on the done list
document.getElementById("doneList").addEventListener("drop", function() {
    dropTask("done", this);
});

/**
 * Drops a task from a list in another list
 * @param listName Name of the target list
 * @param list     Target list div
 */
function dropTask(listName, list) {
    const TASKLIST = draggedTask.parentNode.id;

    if (TASKLIST !== (listName + "List")) {
        const taskHeight = draggedTask.offsetHeight + 10;
        
        // Remove the task from its originary list
        draggedTask.parentNode.removeChild(draggedTask);

        // Move the task here
        switch (TASKLIST) {
            case "toDoList":
                draggedTask.classList.remove("toDo");
                toDoListHeight -= taskHeight;
                break;
            case "ongoingList":
                draggedTask.classList.remove("ongoing");            
                ongoingListHeight -= taskHeight;
                break;
            case "doneList":
                draggedTask.classList.remove("done");
                doneListHeight -= taskHeight;
        }
        draggedTask.classList.add(listName);
        list.appendChild(draggedTask);

        // Done list resizing
        switch (listName) {
            case "toDo":
                toDoListHeight += taskHeight;
                break;                
            case "ongoing":
                ongoingListHeight += taskHeight;
                break;                
            case "done":
                doneListHeight += taskHeight;
        }
        resizeLists();
    }
}

/**
 * It creates the delete button for a task
 * @return The new delete button
 */
function deleteButton() {
    const DELETEBUTTON = document.createElement("a");

    DELETEBUTTON.classList.add("deleteButton");
    DELETEBUTTON.addEventListener("click", deleteButtonClick);

    return (DELETEBUTTON);
}

/**
 * It resizes the three lists and their container according to their current content
 */
function resizeLists() {
    const higherListHeight = Math.max(toDoListHeight, ongoingListHeight, doneListHeight);

    document.getElementById("toDoList").style.height = higherListHeight + "px";
    document.getElementById("ongoingList").style.height = higherListHeight + "px";
    document.getElementById("doneList").style.height = higherListHeight + "px";
    
    document.getElementById("listContent").style.height = (higherListHeight + 20) + "px";
}