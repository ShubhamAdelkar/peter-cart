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

const appdiv = document.querySelector("#app");
const inputElement = document.querySelector(".input");
const buttonElement = document.querySelector(".add-item");
const listElement = document.querySelector(".list-box");
const loader = document.querySelector(".loader");
const instructionsModal = document.getElementById("instructionsModal");
const closeModalBtn = document.querySelector(".close-modal");

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

buttonElement.addEventListener("click", async () => {
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
});

function clearInputValue() {
  inputElement.value = "";
}

// Modal Logic
const isFirstVisit = !localStorage.getItem("modalShown");

if (isFirstVisit) {
  instructionsModal.style.display = "block";
} else {
  appdiv.style.filter = "blur(0px)";
  document.body.style.overflow = "auto";
}

closeModalBtn.addEventListener("click", () => {
  instructionsModal.style.display = "none";
  appdiv.style.filter = "blur(0px)";
  document.body.style.overflow = "auto";
  localStorage.setItem("modalShown", true);
});
