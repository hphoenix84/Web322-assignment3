const fs = require("fs");

let items = [];
let categories = [];

// Initialize the data from JSON files
const initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/items.json", "utf8", (err, data) => {
            if (err) {
                reject("Unable to read items.json");
                return;
            }
            items = JSON.parse(data);

            fs.readFile("./data/categories.json", "utf8", (err, data) => {
                if (err) {
                    reject("Unable to read categories.json");
                    return;
                }
                categories = JSON.parse(data);
                resolve();
            });
        });
    });
};

// Add a new item to the store
const addItem = (itemData) => {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;
        itemData.id = items.length + 1;
        items.push(itemData);
        resolve(itemData);
    });
};

const getAllItems = () => {
    return new Promise((resolve, reject) => {
        items.length > 0 ? resolve(items) : reject("No items found");
    });
};

const getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published);
        publishedItems.length > 0 ? resolve(publishedItems) : reject("No published items found");
    });
};

const getCategories = () => {
    return new Promise((resolve, reject) => {
        categories.length > 0 ? resolve(categories) : reject("No categories found");
    });
};

const getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        const itemsByCategory = items.filter(item => item.category == category);
        itemsByCategory.length > 0 ? resolve(itemsByCategory) : reject("No items found for this category");
    });
};

const getItemsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const itemsByDate = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        itemsByDate.length > 0 ? resolve(itemsByDate) : reject("No items found for this date range");
    });
};

const getItemById = (id) => {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id == id);
        item ? resolve(item) : reject("Item not found");
    });
};

module.exports = {
    initialize,
    addItem,
    getAllItems,
    getPublishedItems,
    getCategories,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
};