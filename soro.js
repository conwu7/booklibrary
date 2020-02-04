//Variables
let myLibrary = [];

let displayContainer = document.getElementById('displayContainer');

let inputElements = Array.from(document.getElementsByTagName('input'));
let saveBookbtn = document.getElementById('saveBookbtn');
let newBookbtn = document.getElementById('newBookbtn');

let newBookForm = document.getElementById("newBookForm");

let title = document.getElementById('title');
let author = document.getElementById('author');
let numPages = document.getElementById('numPages');
let yearPub = document.getElementById('yearPub');

let bookEntryCount = 2;
//Initializations
inputElements.forEach(addBreak);

//sample books for now
let book1 = {
    title: 'Flowers for Algernon',
    author: "Don't Actually know",
    numPages: 234,
    yearPub: 1981,
    bookEntryNum: 1
};

let book2 = {
    title: 'If I Stay',
    author: "Gayle Forman",
    numPages: 360,
    yearPub: 2004,
    bookEntryNum: 2
};

myLibrary.push(book1,book2); //temporary until you learn how to save
myLibrary.forEach(object => {render(createDivForBook(object))});

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

function createDivForBook(bookObject) {
    let bookDivContainer = document.createElement('div');
    let bookDiv = document.createElement('div');
    bookDiv.innerHTML += `<h2>${bookObject.title}</h2>`;
    bookDiv.innerHTML += `<h4><span class="prefixValues">by </span>${bookObject.author}</h4>`;
    bookDiv.innerHTML += `<h5>${bookObject.numPages} <span>pages</span></h5>`;
    bookDiv.innerHTML += `<h5><span class="prefixValues">Published in </span> ${bookObject.yearPub}</h5>`;
    let imgButton = document.createElement('button');
    imgButton.addEventListener('click',deleteBook);
    imgButton.innerHTML += `<img src="deleteicon.png">`;
    bookDiv.style.backgroundColor = getRandomColor();
    bookDiv.classList.add("bookDetails");
    bookDiv.style.opacity = "0.6";
    bookDivContainer.dataset.bookEntryNum = `${bookObject.bookEntryNum}`;
    bookDivContainer.appendChild(bookDiv);
    bookDivContainer.appendChild(imgButton);
    return bookDivContainer;
}

function render(element) {
    //Render existing books to html
    displayContainer.appendChild(element);
}

function addBookToLibrary(e) {
    let newBook = new Book();
    myLibrary.push(newBook);
    let newBookElement = createDivForBook(newBook);
    render(newBookElement);
    hideForm();
    e.preventDefault();
}

function deleteBook(e) {
    // remove div then remove from array.
    let divToRemove = e.target.parentElement.parentElement;
    let bookEntryKey = divToRemove.dataset.bookEntryNum;
    divToRemove.parentElement.removeChild(divToRemove);
    myLibrary.splice(myLibrary.findIndex(obj => obj.bookEntryNum === bookEntryKey),1);
}

//Event Listeners
saveBookbtn.addEventListener('click', addBookToLibrary);
newBookbtn.addEventListener('click', unHideForm);


//Prevent Enter
window.addEventListener('keypress',preventEnterOnButtons);

function preventEnterOnButtons(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
}

//Prevent Enter