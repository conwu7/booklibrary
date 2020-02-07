//variables for elements
let displayContainer = document.getElementById('displayContainer');
let inputElements = Array.from(document.getElementsByTagName('input'));
let bookForm = document.getElementById("bookForm");
let newBookForm = document.getElementById("newBookForm");

let saveBookButton = document.getElementById('saveBookbtn');
let newBookButton = document.getElementById('newBookbtn');
let cancelButton = document.getElementById('cancelbtn');

let title = document.getElementById('title');
let author = document.getElementById('author');
let numPages = document.getElementById('numPages');
let yearPub = document.getElementById('yearPub');

let myLibrary = [];
let bookEntryCount = 0;
let editMode;
let currentKeyEditing;

//get started
inputElements.forEach(addBreak);

let book1 = new Book('Flowers for Algernon','Daniel Keyes', 234, 1958);
let book2 = new Book('If I stay', 'Gayle Forman', 360, 2009);

myLibrary.push(book1,book2); //temporary until you learn how to save
myLibrary.forEach(object => {render(createDivContainerForBook(object))});

//Functions
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function addBreak(e) {
    let br = document.createElement("br");
    e.parentNode.insertBefore(br, e.nextElementSibling);
}

function clearValues() {
    inputElements.forEach(element => element.value='');
    editMode = false;
}

function clearErrors() {
    if (document.querySelector(".errorDiv") != null) {
        bookForm.removeChild(document.querySelector(".errorDiv"));
    }
}

function unHideForm() {
    newBookForm.style.display = 'block';
    newBookButton.style.display = 'none';
}

function hideForm() {
    newBookForm.style.display = 'none';
    newBookButton.style.display = 'block';
    clearErrors();
    clearValues();
}

//ADDING BOOKS
function Book(aTitle, aAuthor, aNumPages, aYearPub) {
    if (arguments.length > 0) {
        this.title = aTitle;
        this.author = aAuthor;
        this.numPages = aNumPages;
        this.yearPub = aYearPub;
    } else {
        this.title = title.value;
        this.author = author.value;
        this.numPages = numPages.value;
        this.yearPub = yearPub.value;
    }
    this.read = false;
}

Book.prototype.toggleReadStatus = function () {
    if (this.read === false) {
        this.read = true;
    } else {
        this.read = false;
    }
};

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

function createDivContainerForBook(bookObject) {
    let bookDivContainer = document.createElement('div');
    let bookDiv = document.createElement('div');

    bookDiv = updateBookDiv(bookDiv, bookObject);

    let deleteImgButton = document.createElement('button');
    let editButton = document.createElement('button');
    let readButton = document.createElement('button');

    deleteImgButton.addEventListener('click',deleteBook);
    deleteImgButton.innerHTML += `<img src="deleteicon.png">`;
    deleteImgButton.classList.add("deletebtn");

    editButton.addEventListener('click', editBook);
    editButton.textContent = "Edit";
    editButton.classList.add('editbtn');

    readButton.addEventListener('click', toggleObjReadStatus);
    readButton.textContent = "Unread";
    readButton.classList.add('readbtn');

    bookObject.bookEntryNum = bookEntryCount;
    bookEntryCount++;

    bookDivContainer.dataset.bookEntryNum = `${bookObject.bookEntryNum}`;
    bookDivContainer.appendChild(bookDiv);
    bookDivContainer.appendChild(editButton);
    bookDivContainer.appendChild(readButton);
    bookDivContainer.appendChild(deleteImgButton);
    bookDivContainer.style.position = 'relative';
    return bookDivContainer;
}

function render(element) {
    //Render existing books to html
    displayContainer.appendChild(element);
}


function editBook(e) {
    unHideForm();
    editMode = true;

    currentKeyEditing = +(e.target.parentElement.dataset.bookEntryNum);
    let indexOfObj = myLibrary.findIndex(obj => obj.bookEntryNum === currentKeyEditing);

    //display existing object values
    title.value = myLibrary[indexOfObj].title;
    author.value = myLibrary[indexOfObj].author;
    numPages.value = myLibrary[indexOfObj].numPages;
    yearPub.value = myLibrary[indexOfObj].yearPub;
}

function toggleObjReadStatus(e) {
    let keyToToggle = +(e.target.parentElement.dataset.bookEntryNum);
    let indexOfObj = myLibrary.findIndex(obj => obj.bookEntryNum === keyToToggle);

    myLibrary[indexOfObj].toggleReadStatus();
    if (myLibrary[indexOfObj].read === true) {
        e.target.textContent = "Read";
        e.target.style.backgroundColor = "Green";
    } else {
        e.target.textContent = "Unread";
        e.target.style.backgroundColor = "Yellow";
    }
}

function validateInputs() {
    let errorMessage = [];
    if (title.value === "" || author.value === "" || numPages.value === "" || yearPub.value === "") {
        errorMessage.push("Please fill out all fields")
        return  errorMessage;
    }

    if (yearPub.value > new Date().getFullYear() || yearPub.value < 1500 || isNaN(yearPub.value)) {
        errorMessage.push("Please enter a valid Published Year for this book")
    }
    if (isNaN(numPages.value) || numPages.value < 1 || numPages.value > 999999) {
        errorMessage.push("Please enter a valid number of pages for this book")
    }
    if (author.length > 30) {
        errorMessage.push("Please shorten the author's name")
    }
    return errorMessage;
}

function saveUpdateRender(e) {
    clearErrors();
    if (validateInputs().length > 0) {
        let errorDiv = document.createElement('div');
        errorDiv.classList.add("errorDiv");
        validateInputs().forEach(function(errorMes) {
            let errorLine = document.createElement('p');
            errorLine.textContent = errorMes;
            errorDiv.appendChild(errorLine);
        });
        bookForm.insertBefore(errorDiv, cancelButton);
        return;
    }

    if (editMode) {
        myLibrary[currentKeyEditing].title = title.value;
        myLibrary[currentKeyEditing].author = author.value;
        myLibrary[currentKeyEditing].numPages = numPages.value;
        myLibrary[currentKeyEditing].yearPub = yearPub.value;

        let bookDiv = document.querySelector(`[data-book-entry-num="${currentKeyEditing}"]`).firstElementChild;
        updateBookDiv(bookDiv, myLibrary[currentKeyEditing]);

        editMode = false;
    } else {
        let newBook = new Book();
        myLibrary.push(newBook);
        let newBookElement = createDivContainerForBook(newBook);
        render(newBookElement);
    }

    hideForm();
    // e.preventDefault();
}

function deleteBook(e) {
    // remove div then remove from array.
    let divToRemove = e.target.parentElement.parentElement;
    let bookEntryKey = +(divToRemove.dataset.bookEntryNum);
    divToRemove.parentElement.removeChild(divToRemove);
    myLibrary.splice(myLibrary.findIndex(obj => obj.bookEntryNum === bookEntryKey),1);
}

function preventEnterOnButtons(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
}

//Event Listeners
saveBookButton.addEventListener('click', saveUpdateRender);
newBookButton.addEventListener('click', unHideForm);
cancelButton.addEventListener('click', hideForm);

//Prevent Enter
window.addEventListener('keypress',preventEnterOnButtons);