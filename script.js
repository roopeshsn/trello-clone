import addGlobalEventListener from "./utils/addGlobalEventListener.js";
import setupDragAndDrop from "./dragAndDrop.js";
import { v4 as uuidV4 } from "uuid";

// selectors
const addList = document.querySelector(".btn-add-list");
const addListInputContainer = document.querySelector(".add-list-input-container");
const btnAddList = document.querySelector(".btn-add-list-2");
const lanesContainer = document.querySelector(".lanes");
const btnClose = document.querySelector(".btn-close");
const addNewListInput = document.querySelector(".add-list-input");

const STORAGE_PREFIX = "TRELLO_CLONE";
const LANES_STORAGE_KEY = `${STORAGE_PREFIX}-lanes`;
const DEFAULT_LANES = {
  backlog: [{ id: uuidV4(), text: "Create your first task" }],
  doing: [],
  done: [],
};

console.log(DEFAULT_LANES);

const lanes = loadLanes();
renderLanes();
renderTasks();

setupDragAndDrop(onDragComplete);

addGlobalEventListener("submit", "[data-add-new-list-form]", (e) => {
  e.preventDefault();

  const listTitle = addNewListInput.value;
  if (listTitle === "") return;

  const laneTitle = listTitle.trim();
  const dataLaneId = laneTitle.toLowerCase().split(" ").join("");
  const laneName = `${dataLaneId}`;
  const listElement = createLaneElement(laneTitle, dataLaneId);
  lanesContainer.insertAdjacentHTML("beforeend", listElement);
  console.log(listElement);
  // lanesContainer.append(listElement);

  DEFAULT_LANES[laneName] = [];
  addNewListInput.value = "";

  saveLanes();
});

addGlobalEventListener("submit", "[data-task-form]", (e) => {
  e.preventDefault();

  const taskInput = e.target.querySelector("[data-task-input]");
  const taskText = taskInput.value;
  if (taskText === "") return;

  const task = { id: uuidV4(), text: taskText };
  const laneElement = e.target.closest(".lane").querySelector("[data-lane-id]");
  lanes[laneElement.dataset.laneId].push(task);

  const taskElement = createTaskElement(task);
  laneElement.append(taskElement);
  taskInput.value = "";

  saveLanes();
});

function onDragComplete(e) {
  const startLaneId = e.startZone.dataset.laneId;
  const endLaneId = e.endZone.dataset.laneId;
  const startLaneTasks = lanes[startLaneId];
  const endLaneTasks = lanes[endLaneId];

  const task = startLaneTasks.find((t) => t.id === e.dragElement.id);
  startLaneTasks.splice(startLaneTasks.indexOf(task), 1);
  endLaneTasks.splice(e.index, 0, task);

  saveLanes();
}

function loadLanes() {
  const lanesJson = localStorage.getItem(LANES_STORAGE_KEY);
  return JSON.parse(lanesJson) || DEFAULT_LANES;
}

function saveLanes() {
  localStorage.setItem(LANES_STORAGE_KEY, JSON.stringify(lanes));
}

function saveLanesDeputy() {
  localStorage.setItem(LANES_STORAGE_KEY, JSON.stringify(DEFAULT_LANES));
}

function renderLanes() {
  Object.entries(lanes).forEach((obj) => {
    const laneId = obj[0];
    const laneTitle = capitalizeFirstLetter(laneId);
    const laneElement = createLaneElement(laneTitle, laneId);
    lanesContainer.insertAdjacentHTML("beforeend", laneElement);
  });
}

function renderTasks() {
  Object.entries(lanes).forEach((obj) => {
    const laneId = obj[0];
    const tasks = obj[1];
    const lane = document.querySelector(`[data-lane-id="${laneId}"]`);
    tasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      lane.append(taskElement);
    });
  });
}

function createTaskElement(task) {
  const element = document.createElement("div");
  element.id = task.id;
  element.innerText = task.text;
  element.classList.add("task");
  element.dataset.draggable = true;
  return element;
}

addList.addEventListener("click", (e) => {
  e.preventDefault();
  addList.classList.toggle("hide");
  addListInputContainer.classList.toggle("hide");
  addNewListInput.focus();
});

btnClose.addEventListener("click", (e) => {
  e.preventDefault();
  addListInputContainer.classList.toggle("hide");
  addList.classList.toggle("hide");
});

function createLaneElement(laneTitle, dataLaneId) {
  let element = `
      <div class="lane" data-lane-name="${dataLaneId}">
        <div class="header">${laneTitle}</div>
        <div class="tasks" data-drop-zone data-lane-id="${dataLaneId}"></div>
        <form data-task-form>
          <input data-task-input class="task-input" type="text" placeholder="Add another card" />
        </form>
      </div>`;
  return element;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
