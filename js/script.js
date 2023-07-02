/**
 * To Do List - JavaScript functionality
 * 
 * @author  Arturo Mora-Rioja (amri@kea.dk)
 * @version 1.0.0 June 2020
 * @version 1.0.1 July 2021     Code style improvements
 * @version 1.0.2 February 2022 Refactoring
 * @version 1.0.3 January 2023  Linting and refactoring
 */
'use strict';

const addTaskText = 'Add';
const updateTaskText = 'Update';
const toDoList = document.querySelector('#toDoList');
let draggedTask = {};

// These variables will be updated every time a task is added, edited, deleted, or if it switches lists.
// They will be checked in the function resizeLists()
let toDoListHeight = toDoList.offsetHeight;
let ongoingListHeight = 0;
let doneListHeight = 0;

// Value initialization on page load
document.addEventListener('DOMContentLoaded', () => {    
    const currentTask = document.querySelector('#currentTask');

    currentTask.setAttribute('currentid', '');   // ID of the task being edited
    currentTask.setAttribute('lastid', '0');     // Highest task ID
});

// Edit a new task
document.querySelector('#addTask').addEventListener('click', () => {
    const currentTask = document.querySelector('#currentTask');
    const txtTask = document.querySelector('#txtTask');
    const newID = parseInt(currentTask.getAttribute('lastid')) + 1;    

    txtTask.value = '';
    document.querySelector('#btnOk').value = addTaskText;
    currentTask.setAttribute('currentid', newID);
    currentTask.style.display = 'block';
    txtTask.focus();
});

// Edit an existing task
const taskClick = function() {
    const currentTask = document.querySelector('#currentTask');
    const txtTask = document.querySelector('#txtTask');
    const ID = parseInt(this.getAttribute('taskId'));
    
    document.querySelector('#btnOk').value = updateTaskText;
    txtTask.value = this.innerText;
    currentTask.setAttribute('currentid', ID);
    currentTask.style.display = 'block';
    txtTask.focus();
};

// Delete a task
const deleteButtonClick = function(e) {
    e.stopPropagation();
    const taskHeight = this.parentElement.offsetHeight + 10;
    const currentListName = this.parentElement.parentElement.id;

    this.parentElement.remove();

    // List height is recalculated
    switch (currentListName) {
    case 'toDoList':    toDoListHeight -= taskHeight;       break;
    case 'ongoingList': ongoingListHeight -= taskHeight;    break;
    case 'doneList':    doneListHeight -= taskHeight;       break;
    }
    resizeLists();
};

// Add or update a task
document.querySelector('#btnOk').addEventListener('click', function() {
    const taskText = document.querySelector('#txtTask');
    const currentTask = document.querySelector('#currentTask');
    
    if (taskText.value.trim() === '') {
        alert('Please insert some text');
        taskText.focus();
        return false;
    }

    if (this.value === addTaskText) {       // Add a to do task        
        // Create the task div
        const task = document.createElement('div');

        task.classList.add('task');
        task.classList.add('toDo');
        task.innerText = taskText.value;
        task.setAttribute('taskId', currentTask.getAttribute('currentid'));
        currentTask.setAttribute('lastid', parseInt(currentTask.getAttribute('lastid')) + 1);
        task.addEventListener('click', taskClick);
        task.setAttribute('draggable', 'true');
        task.addEventListener('dragstart', dragStart);
        task.prepend(deleteButton());

        // Add to the to do list        
        toDoList.prepend(task);

        // Recalculate list height
        toDoListHeight += (task.offsetHeight + 10);

    } else {                                // Update task
        // Update the task div
        const task = document.querySelector('div.task[taskid="' + currentTask.getAttribute('currentid') + '"]');
        const previousHeight = task.offsetHeight;
        const currentListName = task.parentNode.id;

        task.innerText = taskText.value;
        task.prepend(deleteButton());
        
        // Recalculate list height
        switch (currentListName) {
        case 'toDoList':
            toDoListHeight = toDoListHeight - previousHeight + task.offsetHeight;
            break;                
        case 'ongoingList':
            ongoingListHeight = ongoingListHeight - previousHeight + task.offsetHeight;
            break;                
        case 'doneList':
            doneListHeight = doneListHeight - previousHeight + task.offsetHeight;
        }
    }
    resizeLists();
    
    // Clear and hide the modal
    taskText.value = '';
    currentTask.style.display = 'none';
});

// Cancel task edition
const cancelTaskEdition = () => {
    const currentTask = document.querySelector('#currentTask');
    
    currentTask.setAttribute('currentid', '0');
    currentTask.style.display = 'none';
};
document.querySelector('#btnCancel').addEventListener('click', () => cancelTaskEdition());
document.querySelector('#txtTask').addEventListener('keyup', (e) => (e.code === 'Escape' ? cancelTaskEdition() : true));

// Show help
document.querySelector('#showHelp').addEventListener('click', () => {
    document.querySelector('#help').style.display = 'block';
    document.querySelector('#btnClose').focus();
});

// Close help
const hideHelp = () => document.querySelector('#help').style.display = 'none';
const btnClose = document.querySelector('#btnClose');
btnClose.addEventListener('click', hideHelp);
btnClose.addEventListener('keyup', (e) => (e.code === 'Escape' ? hideHelp() : true));    

/*
    Drag and drop functionality
*/
const dragStart = (e) => {
    e.dataTransfer.setData('text/plain', null);
    draggedTask = e.target;
};

// This affects toDoList, ongoingList and doneList
document.querySelectorAll('.listColumn').forEach((list) => {
    list.addEventListener('dragover', (e) => e.preventDefault());
});

// Drop a task on the to do list
document.querySelector('#toDoList').addEventListener('drop', function() {
    dropTask('toDo', this);
        
    // Move the add task button to the end
    const addTask = document.querySelector('#addTask');
    toDoList.removeChild(addTask);
    toDoList.appendChild(addTask);        
});

// Drop a task on the ongoing list
document.querySelector('#ongoingList').addEventListener('drop', function() {
    dropTask('ongoing', this);
});

// Drop a task on the done list
document.querySelector('#doneList').addEventListener('drop', function() {
    dropTask('done', this);
});

/**
 * Drops a task from a list in another list
 * @param listName Name of the target list
 * @param list     Target list div
 */
const dropTask = (listName, list) => {
    const taskList = draggedTask.parentNode.id;

    if (taskList !== (listName + 'List')) {
        const taskHeight = draggedTask.offsetHeight + 10;
        
        // Remove the task from its originary list
        draggedTask.parentNode.removeChild(draggedTask);

        // Move the task here
        switch (taskList) {
        case 'toDoList':
            draggedTask.classList.remove('toDo');
            toDoListHeight -= taskHeight;
            break;
        case 'ongoingList':
            draggedTask.classList.remove('ongoing');            
            ongoingListHeight -= taskHeight;
            break;
        case 'doneList':
            draggedTask.classList.remove('done');
            doneListHeight -= taskHeight;
            break;
        }
        draggedTask.classList.add(listName);
        list.appendChild(draggedTask);

        // List resizing
        switch (listName) {
        case 'toDo':    toDoListHeight += taskHeight;       break;                
        case 'ongoing': ongoingListHeight += taskHeight;    break;                
        case 'done':    doneListHeight += taskHeight;       break;
        }
        resizeLists();
    }
};

/**
 * It creates the delete button for a task
 * @return The new delete button
 */
const deleteButton = () => {
    const deleteButton = document.createElement('a');

    deleteButton.classList.add('deleteButton');
    deleteButton.addEventListener('click', deleteButtonClick);

    return (deleteButton);
};

/**
 * It resizes the three lists and their container according to their current content
 */
const resizeLists = () => {
    const higherListHeight = Math.max(toDoListHeight, ongoingListHeight, doneListHeight);

    document.querySelectorAll('.listColumn').forEach((list) => {
        list.style.height = higherListHeight + 'px';
    });
    
    document.querySelector('#listContent').style.height = (higherListHeight + 20) + 'px';
};