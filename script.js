const addForm = document.getElementById("add-form");
const nameInput = document.getElementById("name");
const sizeInput = document.getElementById("size");
const quantityInput = document.getElementById("quantity");
const inventoryList = document.getElementById("inventory-list");

// Function to get inventory data from local storage
function getInventoryData() {
    try {
        return JSON.parse(localStorage.getItem("warehouseInventory")) || [];
    } catch (error) {
        console.error("Error getting data from local storage:", error);
        return [];
    }
}

// Function to save inventory data to local storage
function saveInventoryData(data) {
    try {
        localStorage.setItem("warehouseInventory", JSON.stringify(data));
    } catch (error) {
        console.error("Error saving data to local storage:", error);
    }
}

// Function to sort and combine inventory by name and size
function sortAndCombineInventory(data) {
    const combinedInventory = [];
    const combinedMap = new Map();

    data.forEach((item) => {
        const key = item.name + item.size;
        if (combinedMap.has(key)) {
            // Combine items with the same name and size
            combinedMap.get(key).quantity += item.quantity;
        } else {
            combinedMap.set(key, { ...item });
        }
    });

    // Sort the combined items by name, then by size
    combinedMap.forEach((item) => {
        combinedInventory.push(item);
    });

    combinedInventory.sort((a, b) => {
        const nameComparison = a.name.localeCompare(b.name);
        if (nameComparison === 0) {
            return a.size.localeCompare(b.size);
        }
        return nameComparison;
    });

    return combinedInventory;
}

// Function to increment the quantity of an item
function incrementItemQuantity(name, size) {
    const inventoryData = getInventoryData();
    const itemIndex = inventoryData.findIndex(
        (item) => item.name === name && item.size === size
    );

    if (itemIndex !== -1) {
        inventoryData[itemIndex].quantity += 1;
        saveInventoryData(inventoryData);
        displaySortedAndCombinedInventory();
    }
}

// Function to decrement the quantity of an item
function decrementItemQuantity(name, size) {
    const inventoryData = getInventoryData();
    const itemIndex = inventoryData.findIndex(
        (item) => item.name === name && item.size === size
    );

    if (itemIndex !== -1 && inventoryData[itemIndex].quantity > 0) {
        inventoryData[itemIndex].quantity -= 1;
        saveInventoryData(inventoryData);
        displaySortedAndCombinedInventory();
    }
}

// Function to remove an item from the inventory
function removeItemFromInventory(name, size) {
    const inventoryData = getInventoryData();
    const itemIndex = inventoryData.findIndex(
        (item) => item.name === name && item.size === size
    );

    if (itemIndex !== -1) {
        inventoryData.splice(itemIndex, 1);
    }

    saveInventoryData(inventoryData);
    displaySortedAndCombinedInventory();
}

// Function to display the sorted and combined inventory
function displaySortedAndCombinedInventory() {
    const inventoryData = getInventoryData();
    const sortedCombinedInventory = sortAndCombineInventory(inventoryData);

    inventoryList.innerHTML = "";

    sortedCombinedInventory.forEach((item) => {
        const listItem = document.createElement("li");
        const itemName = document.createElement("span");
        const itemSize = document.createElement("span");
        const itemQuantity = document.createElement("span");
        const removeButton = document.createElement("button");
        const incrementButton = document.createElement("button");
        const decrementButton = document.createElement("button");

        // Set the text content for name, size, and quantity
        itemName.textContent = "Name: " + item.name;
        itemSize.textContent = "Size: " + item.size;
        itemQuantity.textContent = "Quantity: " + item.quantity;

        // Remove button
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => {
            removeItemFromInventory(item.name, item.size);
        });

        // Increment button
        incrementButton.textContent = "+";
        incrementButton.addEventListener("click", () => {
            incrementItemQuantity(item.name, item.size);
        });

        // Decrement button
        decrementButton.textContent = "-";
        decrementButton.addEventListener("click", () => {
            decrementItemQuantity(item.name, item.size);
        });

        // Append elements to the list item
        listItem.appendChild(itemName);
        listItem.appendChild(itemSize);
        listItem.appendChild(itemQuantity);
        listItem.appendChild(incrementButton);
        listItem.appendChild(decrementButton);
        listItem.appendChild(removeButton);

        // Append the list item to the inventory list
        inventoryList.appendChild(listItem);
    });
}

addForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = nameInput.value;
    const size = sizeInput.value;
    const quantity = parseInt(quantityInput.value, 10);

    if (name && size && !isNaN(quantity) && quantity > 0) {
        addItemToInventory(name, size, quantity);

        // Clear the input fields
        nameInput.value = "";
        sizeInput.value = "";
        quantityInput.value = "";
    }
});

// Function to add an item to the inventory
function addItemToInventory(name, size, quantity) {
    const inventoryData = getInventoryData();
    const existingItem = inventoryData.find(
        (item) => item.name === name && item.size === size
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        inventoryData.push({ name, size, quantity });
    }

    saveInventoryData(inventoryData);
    displaySortedAndCombinedInventory();
}

// Initial display of sorted and combined inventory
displaySortedAndCombinedInventory();


// emergency download copy of it
// Function to get inventory data from local storage
function getInventoryData() {
    try {
        return JSON.parse(localStorage.getItem("warehouseInventory")) || [];
    } catch (error) {
        console.error("Error getting data from local storage:", error);
        return [];
    }
}

// Function to send the inventory data as an email
function sendInventoryEmail() {
    const inventoryData = getInventoryData();

    if (inventoryData.length === 0) {
        alert("Inventory is empty. Nothing to send.");
        return;
    }

    // Generate an HTML table for the inventory data
    const table = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Quantity</th>
                </tr>
            </thead>
            <tbody>
                ${inventoryData.map((item) => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.size}</td>
                        <td>${item.quantity}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Create an invisible link with the HTML content and trigger a click event
    const link = document.createElement("a");
    link.href = `data:text/html,${encodeURIComponent(table)}`;
    link.download = "inventory.html";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById("email-inventory").addEventListener("click", sendInventoryEmail);
