import { initializeApp } from "firebase/app";
import {
  DataSnapshot,
  getDatabase,
  onValue,
  push,
  ref,
} from "firebase/database";
import { Notyf } from "notyf";

const notyf = new Notyf();

const firebaseConfig = {
  databaseURL: "https://add-to-cart-shubham-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const db = ref(database, "spiderlist");

const inputElement = document.querySelector(".input");
const buttonElement = document.querySelector(".add-item");
const listElement = document.querySelector(".list-box");
const loader = document.querySelector(".loader");

function displayList(data) {
  listElement.innerHTML = "";
  for (const key in data) {
    addItemInList(data[key]);
  }
}

onValue(db, async (DataSnapshot) => {
  try {
    const data = await DataSnapshot.val();
    displayList(data);
    loader.style.display = "none";
  } catch (error) {
    loader.style.display = "none";
    alert("Failed to load data");
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

function addItemInList(value) {
  const listItem = document.createElement("li");
  listItem.textContent = value;
  listElement.appendChild(listItem);
}
