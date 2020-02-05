//Variables
let myLibrary = [];

let displayContainer = document.getElementById('displayContainer');

let inputElements = Array.from(document.getElementsByTagName('input'));
let saveBookbtn = document.getElementById('saveBookbtn');
let newBookbtn = document.getElementById('newBookbtn');
let cancelbtn = document.getElementById('cancelbtn');

let newBookForm = document.getElementById("newBookForm");

let title = document.getElementById('title');
let author = document.getElementById('author');
let numPages = document.getElementById('numPages');
let yearPub = document.getElementById('yearPub');

let bookEntryCount = 1;
let editMode;
let currentKeyEditing;
//Initializations
inputElements.forEach(addBreak);

//sample books for now
let book1 = {
    title: 'Flowers for Algernon',
    author: "Don't Actually know",
    numPages: 234,
    yearPub: 1981,
    bookEntryNum: 0
};

let book2 = {
    title: 'If I Stay',
    author: "Gayle Forman",
    numPages: 360,
    yearPub: 2004,
    bookEntryNum: 1
};

myLibrary.push(book1,book2); //temporary until you learn how to save
myLibrary.forEach(object => {render(createDivForNewBook(object))});

//Functions

//from stackOverFlow
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//add break
function addBreak(e) {
    let br = document.createElement("br");
    e.parentNode.insertBefore(br, e.nextElementSibling);
}

function unHideForm() {
    newBookForm.style.display = 'block';
    newBookbtn.style.display = 'none';
}

function hideForm() {
    newBookForm.style.display = 'none';
    newBookbtn.style.display = 'block';
    clearValues();
}

function clearValues() {
    inputElements.forEach(element => element.value='');
    editMode = false;
}
//Book constructor
function Book() {
    this.title = title.value;
    this.author = author.value;
    this.numPages = numPages.value;
    this.yearPub = yearPub.value;
    this.bookEntryNum = bookEntryCount+1;
    bookEntryCount++;
}

//Empty, then populate div
function updateBookDiv(divEl, bookObject) {
    let currentColor = "";
    if (divEl.style.backgroundColor) currentColor = divEl.style.backgroundColor;

    divEl.innerHTML = "";

    divEl.innerHTML += `<h2>${bookObject.title}</h2>`;
    divEl.innerHTML += `<h4><span class="prefixValues">by </span>${bookObject.author}</h4>`;
    divEl.innerHTML += `<h5>${bookObject.numPages} <span>pages</span></h5>`;
    divEl.innerHTML += `<h5><span class="prefixValues">Published in </span> ${bookObject.yearPub}</h5>`;

    divEl.classList.add("bookDetails");
    divEl.style.opacity = "0.6";

    if (currentColor.length > 2) { divEl.style.backgroundColor = currentColor}
    else {divEl.style.backgroundColor = getRandomColor();}

    return divEl;
}

function createDivForNewBook(bookObject) {
    let bookDivContainer = document.createElement('div');
    let bookDiv = document.createElement('div');

    bookDiv = updateBookDiv(bookDiv, bookObject);

    let deleteImgButton = document.createElement('button');
    let editButton = document.createElement('button');

    deleteImgButton.addEventListener('click',deleteBook);
    deleteImgButton.id = "deletebtn";
    deleteImgButton.innerHTML += `<img src="deleteicon.png">`;

    editButton.addEventListener('click', editBook);
    editButton.textContent = "Edit";
    editButton.id = 'editbtn';

    bookDivContainer.dataset.bookEntryNum = `${bookObject.bookEntryNum}`;
    bookDivContainer.appendChild(bookDiv);
    bookDivContainer.appendChild(editButton);
    bookDivContainer.appendChild(deleteImgButton);
    return bookDivContainer;
}


function render(element) {
    //Render existing books to html
    displayContainer.appendChild(element);
}

//after hitting save
function updateLibraryAndRender(e) {
    if (editMode) {
        myLibrary[currentKeyEditing].title = title.value;
        myLibrary[currentKeyEditing].author = author.value;
        myLibrary[currentKeyEditing].numPages = numPages.value;
        myLibrary[currentKeyEditing].yearPub = yearPub.value;

        let bookDiv = document.querySelector(`[data-book-entry-num="${currentKeyEditing}"]`).firstElementChild;
        updateBookDiv(bookDiv, myLibrary[currentKeyEditing]);

        editMode = false;
        hideForm();
        // e.preventDefault();
        return;
    }

    let newBook = new Book();
    myLibrary.push(newBook);
    let newBookElement = createDivForNewBook(newBook);
    render(newBookElement);
    hideForm();
    // e.preventDefault();
}

function editBook(e) {
    editMode = true;

    unHideForm();

    let bookEntryKey = +(e.target.parentElement.dataset.bookEntryNum);
    currentKeyEditing = bookEntryKey;
    let indexOfObj = myLibrary.findIndex(obj => obj.bookEntryNum == bookEntryKey);

    //display existing object values
    title.value = myLibrary[indexOfObj].title;
    author.value = myLibrary[indexOfObj].author;
    numPages.value = myLibrary[indexOfObj].numPages;
    yearPub.value = myLibrary[indexOfObj].yearPub;
}

function deleteBook(e) {
    // remove div then remove from array.
    let divToRemove = e.target.parentElement.parentElement;
    let bookEntryKey = divToRemove.dataset.bookEntryNum;
    divToRemove.parentElement.removeChild(divToRemove);
    myLibrary.splice(myLibrary.findIndex(obj => obj.bookEntryNum === bookEntryKey),1);
}

//Event Listeners
saveBookbtn.addEventListener('click', updateLibraryAndRender);
newBookbtn.addEventListener('click', unHideForm);
cancelbtn.addEventListener('click', hideForm);

//Prevent Enter
window.addEventListener('keypress',preventEnterOnButtons);

function preventEnterOnButtons(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
}

//Prevent Enter