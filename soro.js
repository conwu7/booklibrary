const LibraryElements = (() => {
    //divs
    let displayContainer = document.getElementById('displayContainer');
    let inputElements = Array.from(document.getElementsByTagName('input'));
    let bookForm = document.getElementById("bookForm");
    let newBookForm = document.getElementById("newBookForm");
    //buttons
    let saveBookButton = document.getElementById('saveBookbtn');
    let newBookButton = document.getElementById('newBookbtn');
    let cancelButton = document.getElementById('cancelbtn');
    //input fields
    let title = document.getElementById('title');
    let author = document.getElementById('author');
    let numPages = document.getElementById('numPages');
    let yearPub = document.getElementById('yearPub');
    let bookColor = document.getElementById('bookColor');

    inputElements.forEach(addBreak);
    function addBreak(e) {
        let br = document.createElement("br");
        e.parentNode.insertBefore(br, e.nextElementSibling);
    }
    const addEventHandlers = () => {
        saveBookButton.addEventListener('touchstart click', BookModule.saveUpdateRender);
        newBookButton.addEventListener('touchstart click', BookModule.unHideForm);
        cancelButton.addEventListener('touchstart click', BookModule.hideForm);
        window.addEventListener('touchstart click', BookModule.preventEnterOnButtons);
        saveBookButton.addEventListener('click', BookModule.saveUpdateRender);
        newBookButton.addEventListener('click', BookModule.unHideForm);
        cancelButton.addEventListener('click', BookModule.hideForm);
        window.addEventListener('keypress', BookModule.preventEnterOnButtons);
    };
    return {addEventHandlers, displayContainer, inputElements, bookForm, newBookForm,saveBookButton, newBookButton, cancelButton,
        title, author, numPages, yearPub, bookColor}
})();

const BookModule = (function () {
    let myLibrary = [];
    let bookEntryCount = null;
    let editMode, currentKeyEditing, currentIndexForStorage;
    //local storage to myLibrary and then render. if empty, use two default books.
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
        _saveObjToLocalStorage(book1);
        _saveObjToLocalStorage(book2);
    }
    //Doing this until I figure out how local storage indexes new items. Keep order consistent for user
    myLibrary.sort(function(a, b) {
        return a.indexForStorage - b.indexForStorage;
    });
    myLibrary.forEach(object => {_showInLibrary(_createDivContainerForBook(object))});

    function _hexToRgb(hex) {
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
    function _isContrastLow(colorOne, colorTwo) { //colorTwo should be the darker color.
        let colorOneRGB = _hexToRgb(colorOne);
        let colorTwoRGB = _hexToRgb(colorTwo);
        const formatRGB = (colorObj) => {
            let colorKeys = Object.keys(colorObj);
            for (const key in colorKeys) {
                colorObj[key] /= 255;
                colorObj[key] = colorObj[key] > 0 ? ((colorObj[key]
                    + 0.055) / 1.055) ** 2.4 : colorObj[key] / 12.92;
            }
            return colorObj;
        };
        colorOneRGB = formatRGB(colorOneRGB);
        colorTwoRGB = formatRGB(colorTwoRGB);

        let l1 = (0.2126*colorOneRGB.r) + (0.7152*colorOneRGB.g) + (0.0722*colorOneRGB.b);
        let l2 = (0.2126*colorTwoRGB.r) + (0.7152*colorTwoRGB.g) + (0.0722*colorTwoRGB.b);
        let contrast =  (l1 + 0.05) / (l2 + 0.05);
        return (contrast < 4.5);
    }
    function _saveObjToLocalStorage(obj) { //object should have an indexForStorage property
        localStorage.setItem(`${obj.indexForStorage}`, JSON.stringify(obj));
    }

    function _removeObjFromLocalStorage(obj) {//object should have an indexForStorage property
        localStorage.removeItem(obj.indexForStorage);
    }
    function _clearElementValues(elementArray) { //accepts array of elements. clears the values
        elementArray.forEach(element => {
            element.value = element.id === "bookColor" ? '#FBF2E3': '';
        });
    }
    function _removeElement(element) {
        if (document.querySelector(".errorDiv") != null) {
            element.removeChild(document.querySelector(".errorDiv"));
        }
    }
    function unHideForm() {
        LibraryElements.newBookForm.style.display = 'block';
        LibraryElements.newBookButton.style.display = 'none';
    }

    function hideForm() {
        LibraryElements.newBookForm.style.display = 'none';
        LibraryElements.newBookButton.style.display = 'block';
        _removeElement(LibraryElements.bookForm);
        _clearElementValues(LibraryElements.inputElements);
        editMode = false;
    }


    //Public functions
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
    function _updateBookDiv(divElement, bookObject) {
        divElement.innerHTML = "";

        divElement.innerHTML += `<h2>${bookObject.title.toLocaleUpperCase()}</h2>`;
        divElement.innerHTML += `<h4><span class="prefixValues">by </span>${bookObject.author}</h4>`;
        divElement.innerHTML += `<h5>${bookObject.numPages} <span>pages</span></h5>`;
        divElement.innerHTML += `<h5><span class="prefixValues">Published in </span> ${bookObject.yearPub}</h5>`;

        divElement.classList.add("bookDetails");

        divElement.style.backgroundColor = bookObject.bookColor;
        if (_isContrastLow(bookObject.bookColor, "#000000")) {
            divElement.style.color = 'antiquewhite';
        } else {
            divElement.style.color = 'black';
        }

        return divElement;
    }
    function _createDivContainerForBook(bookObject) {
        let bookDivContainer = document.createElement('div');
        let bookDiv = document.createElement('div');

        bookDiv = _updateBookDiv(bookDiv, bookObject);

        let deleteImgButton = document.createElement('button');
        let editButton = document.createElement('button');
        let readButton = document.createElement('button');

        deleteImgButton.addEventListener('click',_deleteBook);
        deleteImgButton.innerHTML += `<img alt="Delete Icon" src="deleteicon.png">`;
        deleteImgButton.classList.add("deletebtn");

        editButton.addEventListener('click', editBook);
        editButton.textContent = "Edit";
        editButton.classList.add('editbtn');

        readButton.addEventListener('click', _toggleObjReadStatus);
        readButton.classList.add('readbtn');

        if (bookObject.read) {
            readButton.textContent = "Read";
            readButton.style.backgroundColor = "Green";
        } else {
            readButton.textContent = "Unread";
        }

        bookObject.bookEntryNum = bookEntryCount? bookEntryCount: 0;
        bookEntryCount ++;

        bookDivContainer.dataset.bookEntryNum = `${bookObject.bookEntryNum}`;

        bookDivContainer.appendChild(bookDiv);
        bookDivContainer.appendChild(editButton);
        bookDivContainer.appendChild(readButton);
        bookDivContainer.appendChild(deleteImgButton);
        bookDivContainer.style.position = 'relative'; //this is for the absolute positioning of the read button
        return bookDivContainer;
    }
    function _showInLibrary(element) {
        //Render existing books to html
        LibraryElements.displayContainer.appendChild(element);
    }
    function editBook(e) {
        unHideForm();
        editMode = true;

        currentKeyEditing = +(e.target.parentElement.dataset.bookEntryNum);
        let indexOfObj = myLibrary.findIndex(obj => obj.bookEntryNum === currentKeyEditing);

        //display existing object values in input fields
        title.value = myLibrary[indexOfObj].title;
        author.value = myLibrary[indexOfObj].author;
        numPages.value = myLibrary[indexOfObj].numPages;
        yearPub.value = myLibrary[indexOfObj].yearPub;
        bookColor.value = myLibrary[indexOfObj].bookColor;
    }
    function _toggleObjReadStatus(e) {
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
        _saveObjToLocalStorage(myLibrary[indexOfObj]);
    }
    function _validateInputs() {
        let errorMessage = [];
        if (LibraryElements.title.value === "" || LibraryElements.author.value === "" || LibraryElements.numPages.value === ""
            || LibraryElements.yearPub.value === "") {
            errorMessage.push("Please fill out all fields");
            return  errorMessage;
        }

        if (yearPub.value > new Date().getFullYear() || yearPub.value < 1500 || isNaN(yearPub.value)) {
            errorMessage.push("Please enter a valid year for the published date")
        }
        if (isNaN(numPages.value) || numPages.value < 1 || numPages.value > 999999) {
            errorMessage.push("Please enter a valid number of pages")
        }
        if (author.length > 30) {
            errorMessage.push("Please shorten the author's name")
        }
        return errorMessage;
    }
    function saveUpdateRender() {
        _removeElement(LibraryElements.bookForm);
        if (_validateInputs().length > 0) {
            let errorDiv = document.createElement('div');
            errorDiv.classList.add("errorDiv");
            _validateInputs().forEach(function(errorMes) {
                let errorLine = document.createElement('p');
                errorLine.textContent = errorMes;
                errorDiv.appendChild(errorLine);
            });
            LibraryElements.bookForm.insertBefore(errorDiv, LibraryElements.cancelButton);
            return;
        }

        if (editMode) {
            myLibrary[currentKeyEditing].title = LibraryElements.title.value;
            myLibrary[currentKeyEditing].author = LibraryElements.author.value;
            myLibrary[currentKeyEditing].numPages = LibraryElements.numPages.value;
            myLibrary[currentKeyEditing].yearPub = LibraryElements.yearPub.value;
            myLibrary[currentKeyEditing].bookColor = LibraryElements.bookColor.value;

            let bookDiv = document.querySelector(`[data-book-entry-num="${currentKeyEditing}"]`).firstElementChild;
            _updateBookDiv(bookDiv, myLibrary[currentKeyEditing]);
            editMode = false;
            _saveObjToLocalStorage(myLibrary[currentKeyEditing]);
        } else {
            let newBook = new Book();
            myLibrary.push(newBook);
            let newBookElement = _createDivContainerForBook(newBook);
            _showInLibrary(newBookElement);
            _saveObjToLocalStorage(newBook);
        }
        hideForm();
    }
    function _deleteBook(e) {
        // remove div then remove from array.
        let divToRemove = e.target.parentElement.parentElement;
        let bookEntryKey = +(divToRemove.dataset.bookEntryNum);
        let objIndex = myLibrary.findIndex(obj => obj.bookEntryNum === bookEntryKey);
        divToRemove.parentElement.removeChild(divToRemove);
        _removeObjFromLocalStorage(myLibrary[objIndex]);
        myLibrary.splice(objIndex,1);   //important to remove it from Local Storage before the array

    }
    function preventEnterOnButtons(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }

    return {saveUpdateRender, preventEnterOnButtons, unHideForm, hideForm}
})();

LibraryElements.addEventHandlers();

