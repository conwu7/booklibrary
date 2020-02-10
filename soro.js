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
let bookColor = document.getElementById('bookColor');

let myLibrary = [];
let bookEntryCount = 0;
let editMode;
let currentKeyEditing;
let currentIndexForStorage;

//get started
inputElements.forEach(addBreak);


if (localStorage.length > 0) {
    for (let i=0; i < localStorage.length; i++) {
        let keyLS = localStorage.key(i);
        if (keyLS === "storageIndex") {continue}
        let objDeConv = JSON.parse(localStorage.getItem(keyLS));
        objDeConv.toggleReadStatus = function() {
            this.read = this.read === false;
        };
        myLibrary.push(objDeConv);
        currentIndexForStorage = localStorage.getItem("storageIndex");
    }
} else {
    currentIndexForStorage = 0;
    let book1 = new Book('Flowers for Algernon','Daniel Keyes', 234, 1958, "#008b8b");
    let book2 = new Book('If I stay', 'Gayle Forman', 360, 2009, "#b8860b");
    myLibrary.push(book1,book2);
    saveToLocalStorage(book1);
    saveToLocalStorage(book2);
}

myLibrary.sort(function(a, b) { //Doing this until I figure out how local storage indexes new items
    return a.indexForStorage - b.indexForStorage;
});
myLibrary.forEach(object => {render(createDivContainerForBook(object))});

//Functions
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function isContrastLow(colorOne, colorTwo) { //colorTwo should be the darker color.
    let rgbColorOne = hexToRgb(colorOne);
    let rgbColorTwo = hexToRgb(colorTwo);

    for (const prop in rgbColorOne) {
        // noinspection JSUnfilteredForInLoop
        rgbColorOne[prop] /= 255;
        if (rgbColorOne[prop] > 0) {
            rgbColorOne[prop] = ((rgbColorOne[prop] + 0.055)/1.055)**2.4
        } else {
            // noinspection JSUnfilteredForInLoop
            rgbColorOne[prop] = (rgbColorOne[prop]/12.92);
        }
    }
    for (const prop in rgbColorTwo) {
        rgbColorTwo[prop] /= 255;
        if (rgbColorTwo[prop] > 0) {
            rgbColorTwo[prop] = ((rgbColorTwo[prop] + 0.055)/1.055)**2.4
        } else {
            rgbColorTwo[prop] = (rgbColorTwo[prop]/12.92);
        }
    }

    let l1 = (0.2126*rgbColorOne.r) + (0.7152*rgbColorOne.g) + (0.0722*rgbColorOne.b);
    let l2 = (0.2126*rgbColorTwo.r) + (0.7152*rgbColorTwo.g) + (0.0722*rgbColorTwo.b);
    let contrast =  (l1 + 0.05) / (l2 + 0.05);
    return (contrast < 4.5);
}

function saveToLocalStorage(obj) {
    let indexStorage = obj.indexForStorage;
    let objConverted = JSON.stringify(obj);
    localStorage.setItem(`${indexStorage}`, objConverted);
}

function removeFromLocalStorage(obj) {
    let indexStorage = obj.indexForStorage;
    localStorage.removeItem(indexStorage);
}

function addBreak(e) {
    let br = document.createElement("br");
    e.parentNode.insertBefore(br, e.nextElementSibling);
}

function clearValues() {
    inputElements.forEach(element => {
        if (element.id === "bookColor") {
            element.value = "#FBF2E3"
        } else {
            element.value = ''
        }
    });
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
function Book(aTitle, aAuthor, aNumPages, aYearPub, aBookColor) {
    if (arguments.length > 0) {
        this.title = aTitle;
        this.author = aAuthor;
        this.numPages = aNumPages;
        this.yearPub = aYearPub;
        this.bookColor = aBookColor;
    } else {
        this.title = title.value;
        this.author = author.value;
        this.numPages = numPages.value;
        this.yearPub = yearPub.value;
        this.bookColor = bookColor.value;
    }

    this.indexForStorage = currentIndexForStorage;
    currentIndexForStorage++;
    localStorage.setItem("storageIndex", currentIndexForStorage.toString());
    this.read = false;
    this.toggleReadStatus = function() {
        this.read = this.read === false;
    }
}

//Empty, then populate div
function updateBookDiv(divEl, bookObject) {
    divEl.innerHTML = "";

    divEl.innerHTML += `<h2>${bookObject.title.toLocaleUpperCase()}</h2>`;
    divEl.innerHTML += `<h4><span class="prefixValues">by </span>${bookObject.author}</h4>`;
    divEl.innerHTML += `<h5>${bookObject.numPages} <span>pages</span></h5>`;
    divEl.innerHTML += `<h5><span class="prefixValues">Published in </span> ${bookObject.yearPub}</h5>`;

    divEl.classList.add("bookDetails");


    divEl.style.backgroundColor = bookObject.bookColor;
    if (isContrastLow(bookObject.bookColor, "#000000")) {
        divEl.style.color = 'antiquewhite';
    } else {
        divEl.style.color = 'black';
    }

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
    deleteImgButton.innerHTML += `<img alt="Delete Icon" src="deleteicon.png">`;
    deleteImgButton.classList.add("deletebtn");

    editButton.addEventListener('click', editBook);
    editButton.textContent = "Edit";
    editButton.classList.add('editbtn');

    readButton.addEventListener('click', toggleObjReadStatus);
    readButton.classList.add('readbtn');

    if (bookObject.read) {
        readButton.textContent = "Read";
        readButton.style.backgroundColor = "Green";
    } else {
        readButton.textContent = "Unread";
    }

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
    bookColor.value = myLibrary[indexOfObj].bookColor;
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
    saveToLocalStorage(myLibrary[indexOfObj]);
}

function validateInputs() {
    let errorMessage = [];
    if (title.value === "" || author.value === "" || numPages.value === "" || yearPub.value === "") {
        errorMessage.push("Please fill out all fields");
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

function saveUpdateRender() {
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
        myLibrary[currentKeyEditing].bookColor = bookColor.value;

        let bookDiv = document.querySelector(`[data-book-entry-num="${currentKeyEditing}"]`).firstElementChild;
        updateBookDiv(bookDiv, myLibrary[currentKeyEditing]);

        editMode = false;
        saveToLocalStorage(myLibrary[currentKeyEditing]);
    } else {
        let newBook = new Book();
        myLibrary.push(newBook);
        let newBookElement = createDivContainerForBook(newBook);
        render(newBookElement);
        saveToLocalStorage(newBook);
    }

    hideForm();
    // e.preventDefault();
}

function deleteBook(e) {
    // remove div then remove from array.
    let divToRemove = e.target.parentElement.parentElement;
    let bookEntryKey = +(divToRemove.dataset.bookEntryNum);
    let objIndex = myLibrary.findIndex(obj => obj.bookEntryNum === bookEntryKey);
    divToRemove.parentElement.removeChild(divToRemove);
    console.log(objIndex);
    removeFromLocalStorage(myLibrary[objIndex]);
    myLibrary.splice(objIndex,1);

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