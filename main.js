import { initializeApp } from "firebase/app";
import {
  DataSnapshot,
  getDatabase,
  onValue,
  push,
  ref,
  remove,
} from "firebase/database";
import { Notyf } from "notyf";

const notyf = new Notyf();

const firebaseConfig = {
  databaseURL: "https://add-to-cart-shubham-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const db = ref(database, "spiderlist");

const appDiv = document.querySelector("#app");
const credit = document.querySelector(".videoby");
const videoElement = document.querySelector("#myVideo");
const inputElement = document.querySelector(".input");
const buttonElement = document.querySelector(".add-item");
const listElement = document.querySelector(".list-box");
const linkElement = document.querySelector(".link");
const loader = document.querySelector(".loader");
const instructionsModal = document.getElementById("instructionsModal");
const closeModalBtn = document.querySelector(".close-modal");

const isOnline = navigator.onLine;

function displayList(data) {
  listElement.innerHTML = "";
  for (const key in data) {
    const listItem = document.createElement("li");
    listItem.textContent = data[key];
    listItem.addEventListener("dblclick", async () => {
      try {
        remove(ref(database, `spiderlist/${key}`));
        listElement.removeChild(listItem);
        notyf.success(`Item deleted successfully!`);
      } catch (error) {
        notyf.error("Failed to delete Item.");
      }
    });
    listElement.prepend(listItem);
  }
}

onValue(db, async (DataSnapshot) => {
  try {
    const data = await DataSnapshot.val();
    if (DataSnapshot.exists()) {
      displayList(data);
    } else {
      listElement.innerHTML = `<li style="background-color: #383838;">No Items.</li>`;
      setTimeout(() => {
        notyf.error("Please add an Item.");
      }, 2600);
    }
    loader.style.display = "none";
  } catch (error) {
    loader.style.display = "none";
    notyf.error("Failed to load data.");
  }
});

if (!isOnline) {
  notyf.error("You are offline.");
  buttonElement.disabled = true; // Disable button when offline
}

// Handle online/offline changes
window.addEventListener("online", () => {
  notyf.success("You are back online.");
  buttonElement.disabled = false;
});

window.addEventListener("offline", () => {
  notyf.error("You are offline.");
  buttonElement.disabled = true;
});

buttonElement.addEventListener("click", async () => {
  if (isOnline) {
    let value = inputElement.value.trim();
    const isOnlyNumbers = /^\d+$/.test(value);

    try {
      if (value !== "") {
        if (!isOnlyNumbers) {
          await push(db, value);
          clearInputValue();
          notyf.success("Item added successfully!");
        } else {
          throw new Error("Numbers are not allowed!");
        }
      } else {
        throw new Error("Input cannot be empty!");
      }
    } catch (error) {
      notyf.error(error.message);
    }
  }
});

function clearInputValue() {
  inputElement.value = "";
}

// Modal Logic
const isFirstVisit = !localStorage.getItem("modalShown");

if (isFirstVisit) {
  instructionsModal.style.display = "block";
  buttonElement.disabled = true;
  inputElement.disabled = true;
  linkElement.style.display = "none";
  loader.style.display = "none";
} else {
  appDiv.style.filter = "blur(0px)";
  videoElement.style.display = "none";
  document.body.style.overflow = "auto";
  buttonElement.disabled = false;
  inputElement.disabled = false;
  credit.style.display = "none";
  linkElement.style.display = "block";
}

closeModalBtn.addEventListener("click", () => {
  instructionsModal.style.display = "none";
  videoElement.style.display = "none";
  appDiv.style.filter = "blur(0px)";
  document.body.style.overflow = "auto";
  buttonElement.disabled = false;
  inputElement.disabled = false;
  credit.style.display = "none";
  linkElement.style.display = "block";
  localStorage.setItem("modalShown", true);
});
