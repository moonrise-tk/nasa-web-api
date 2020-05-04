//All the items in the document we will use and modify
let grid;
let favoriteGrid;
let modal;
let span;
let modalTitle;
let modalDescription;
let modalDateCreated;
let modalCenter;
let modalKeywords;
let modalImage;
let modalAudio;
let modalVideo;
let modalAudioSource;
let modalVideoSource;
let searchModal;
let searchStartDate;
let searchApply;
let favoriteIcon;
let clearButton;
let nextButton;
let prevButton;
let searchForm;
var searchStartDateText;
let searchEndDate;
var searchEndDateText;
let searchCenter;
var searchCenterText;
let searchKeywords;
var searchKeywordsText;


jQuery(document).ready(function () {
    //All the items in the document we will use and modify
    grid = document.getElementById('grid');
    favoriteGrid = document.getElementById('favorite-grid');
    modal = document.getElementById('modal');
    span = document.getElementById('close-button')
    modalTitle = document.getElementById('modal-title');
    modalDescription = document.getElementById('modal-description');
    modalDateCreated = document.getElementById('modal-date-created');
    modalCenter = document.getElementById('modal-center');
    modalKeywords = document.getElementById('modal-keywords');
    modalImage = document.getElementById('modal-image');
    modalAudio = document.getElementById('modal-audio');
    modalVideo = document.getElementById('modal-video');
    modalAudioSource = document.getElementById('audio-source');
    modalVideoSource = document.getElementById('video-source');
    searchModal = document.getElementById('search-modal');
    searchStartDate = document.getElementById('search-modal-start-date-created');
    searchApply = document.getElementById('apply-search-button');
    favoriteIcon = document.getElementById('favorite-button');
    clearButton = document.getElementById('clear-button');
    nextButton = document.getElementById('next-button');
    prevButton = document.getElementById('prev-button');
    searchForm = document.getElementById('searchform');
    searchStartDateText = "";
    searchEndDate = document.getElementById('search-modal-end-date-created');
    searchEndDateText = "";
    searchCenter = document.getElementById('search-modal-center');
    searchCenterText = "";
    searchKeywords = document.getElementById('search-modal-keywords');
    searchKeywordsText = "";

    searchForm.setAttribute("onfocus",
        `if (this.value == 'Enter search terms . . .') {
            this.value = '';
        } `)

    //The current link for the nasa results
    var currLink;
    //The link to go to next screen, attached to the next button
    var nextLink;
    //The previous link if there is one
    var prevLink;
    //If there is no favorites array created for this user yet, create an empty one.
    if (!localStorage.getItem('favorites')) {
        localStorage.setItem('favorites', JSON.stringify([]));
    }
    jQuery(nextButton).click(function () {
        sendHTTP(goNext(), parseResponse);
    })
    jQuery(prevButton).click(function () {
        sendHTTP(goPrev(), parseResponse);
    })
    jQuery('#clear-button').click(function () {
        localStorage.clear();
        localStorage.setItem('favorites', JSON.stringify([]));
        clearGrid(favoriteGrid);
        showFavorites();
    })
    // Start a new search
    jQuery('#button-nasa-api').click(function () {
        hideFavorites();
        clearGrid(grid);
        sendHTTP(parseSearch(), parseResponse);
    });
    // Onclick event for the find similar button
    jQuery('#find-similar-button').click(function () {
        findSimilar();
    })
    // When you click enter while typing on the search input
    jQuery("#searchform").keypress(function (e) {
        if (e.which == 13) {
            jQuery("#button-nasa-api").click();
        }
    });
    // The apply search filters button
    jQuery('#apply-search-button').click(function () {
        applySearch();
        clearSearchModal();
    });
    // Click on button to open optional search modal
    jQuery("#optional-search-filters-text").click(function () {
        showSearchModal();
    });
    jQuery("#favorites").click(function () {
        if (this.getAttribute('selected') == "true") {
            hideFavorites();
        }
        else {
            showFavorites();
        }

    })
    jQuery("#favorite-button").click(function () {
        toggleFavorite(this);
    })
    span.onclick = function () {
        clearModal();
    }
    window.onclick = function (event) {
        if (event.target == modal) {
            clearModal();
        }
        if (event.target == searchModal) {
            applySearch();
            clearSearchModal();
        }
    }

    $("#toggle-switch-ring").click(function () {
        if (document.getElementById("toggle-switch").getAttribute('selected') == "false") {
            document.getElementById("toggle-switch").setAttribute('selected', "true");
            $("#theme").attr('href', "darkTheme.css");
            $("#github-logo").attr('src', "images/GitHub-Logos/GitHub_Logo_White.png")
        } else {
            document.getElementById("toggle-switch").setAttribute('selected', "false");
            $("#theme").attr('href', "regularTheme.css");
            $("#github-logo").attr('src', "images/GitHub-Logos/GitHub_Logo.png")
        }

    })

    window.addEventListener('resize', function () {
        $(".grid-item-media").width($(grid).width() * 21.0 / 65.0);
    }, true);
});

//Clear out a grid
function clearGrid(Grid) {
    while (Grid.firstChild) {
        Grid.removeChild(Grid.firstChild);
    }
}

//Animate the clear favorites button in
function animateClearIn() {
    var margin = 0;
    var opacity = 0;
    var id = setInterval(frame, 5);
    function frame() {
        if (margin == 10) {
            clearInterval(id);
        } else {
            margin++;
            opacity += 0.1;
            clearButton.style.opacity = opacity;
            clearButton.style.marginLeft = margin + 'px';
        }
    }

}
//Animate the clear favorites button out
function animateClearOut() {
    var margin = 10;
    var opacity = 1;
    var id = setInterval(frame, 5);
    function frame() {
        if (margin == 0) {
            clearInterval(id);
        } else {
            margin--;
            opacity -= 0.1;
            clearButton.style.opacity = opacity;
            clearButton.style.marginLeft = margin + 'px';
        }
    }
}
// Make the optional search filters modal invisible
function clearSearchModal() {
    searchModal.style.display = "none";
}

function showSearchModal() {
    searchModal.style.display = "block";
}
//Called when apply search button is pressed
function applySearch() {
    searchStartDateText = searchStartDate.value;
    searchEndDateText = searchEndDate.value;
    searchCenterText = searchCenter.value;
    searchKeywordsText = searchKeywords.value;
}
//Make it so that when you paste into the search input, the formatting is not copied as well
$('#searchform').on("paste", function (e) {
    e.preventDefault();
    var text = e.clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, text);
});
// Clear the modal (the window opened when you click on a search result)
function clearModal() {
    modal.style.display = "none";
    modalVideo.pause();
    modalAudio.pause()
    modalVideo.style.display = "none";
    modalAudio.style.display = "none";
    modalImage.style.display = "none";
}
//Send a http request
//PARAMS: 
//  text: the text to send to the nasa server
//  func: the function to execute on the server's result
//RETURNS:
//  none
function sendHTTP(text, func) {
    if (!text) {
        return;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", text, true);
    xhttp.onload =
        function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                func(this.responseText);
            }
            else {
                window.setTimeout(alert, 1000);
            }
        }
    xhttp.send();
}
//Parse a response and display items on the grid
//PARAMS:
//  responseText: the text supplied by the nasa server
//RETURNS:
//  none
function parseResponse(responseText) {
    var res = JSON.parse(responseText)
    document.getElementById("metadata").textContent = "Total hits: " + res.collection.metadata.total_hits;
    grid.style.display = "block";

    currLink = res.collection.href;
    parseLinks(res.collection.links);

    var len = res.collection.items.length;
    for (var i = 0; i < len; i++) {
        showItem(res.collection.items[i].data[0], grid);
    }
}
//Parses the links section of the returned JSON the NASA server.
//Uses them to see if there's a previous/next page.
function parseLinks(links) {
    nextLink = null;
    prevLink = null;
    nextButton.style.display = "none";
    prevButton.style.display = "none";
    if (links) {
        len = links.length;
        for (var i = 0; i < len; i++) {
            //There is a next
            if (links[i].rel == "next") {
                nextLink = links[i].href;
            }
            //There is a prev
            if (links[i].rel == "prev") {
                prevLink = links[i].href;
            }
        }
    }
    if (nextLink) {
        nextButton.style.display = "inline-block";
    }
    if (prevLink) {
        prevButton.style.display = "inline-block";
    }
}
function goNext() {
    if (!nextLink) return null;
    clearGrid(grid);
    return nextLink;
}
function goPrev() {
    if (!prevLink) return null;
    clearGrid(grid);
    return prevLink;
}
//Append a nasa item to the grid given the nasa id and media type
//PARAMS:
//  nasa_id: the requested element's nasa id
//  media_type: the requested element's media type
//RETURNS:
//  none
function showItem(data, Grid) {
    var nasa_id = data.nasa_id;
    var media_type = data.media_type;
    var title = data.title;

    sessionStorage.setItem(nasa_id, JSON.stringify(data));

    if (media_type === "image" || media_type === "video") {
        var src = "https://images-assets.nasa.gov/" + media_type + "/" +
            nasa_id + "/" + nasa_id + "~thumb.jpg"

    }
    else if (media_type === "audio") {
        var src = "images/headphone-01.png";
    }
    else {
        return;
    }
    //Create the div and preview img, set some ids, etc. and append it to the grid.
    var div = document.createElement("div");
    var img = document.createElement('img');
    var overlayTitle = document.createElement('div');
    div.setAttribute('class', 'grid-item');
    overlayTitle.setAttribute('class', 'overlayTitle');
    img.setAttribute('onclick', 'showData(this)');
    img.setAttribute('onerror', 'imgNotFound(this)');
    img.setAttribute('id', nasa_id);
    img.setAttribute('class', "grid-item-media");
    img.setAttribute('media-type', media_type);
    img.src = src;
    overlayTitle.textContent = title;
    div.appendChild(img);
    div.appendChild(overlayTitle);
    $(img).width($(grid).width() * 21.0 / 65.0);
    Grid.appendChild(div);

}
//Shows the favorites grid
//Gets the favorites from local storage and displays them if there are any to show.
function showFavorites() {
    clearGrid(favoriteGrid);
    document.getElementById('favorites').setAttribute('selected', 'true');
    favorites = JSON.parse(localStorage.getItem('favorites'));
    if (!favorites) return;
    document.getElementById('metadata').style.display = "none";
    document.getElementById('favorites-metadata').style.display = "block";
    if (favorites.length > 0) {
        document.getElementById('favorites-metadata').textContent = "Number of favorites: " + favorites.length;
    }
    else {
        document.getElementById('favorites-metadata').textContent = "No favorites to show!";
    }
    grid.style.display = "none";
    favoriteGrid.style.display = "block";
    nextButton.style.display = "none";
    prevButton.style.display = "none";
    var i;
    for (i = 0; i < favorites.length; i++) {
        showItem(JSON.parse(localStorage.getItem(favorites[i])), favoriteGrid);
    }
    animateClearIn();

}
//Hides the favorites grid
function hideFavorites() {
    document.getElementById('favorites-metadata').style.display = "none";
    document.getElementById('metadata').style.display = "block";
    document.getElementById('favorites').setAttribute('selected', 'false');
    clearGrid(favoriteGrid);
    grid.style.display = "block";
    favoriteGrid.style.display = "none";
    animateClearOut();
}
//Toggles the favorite button on a certain nasa media. When clicked, it gets
//added to the favorites list. Otherwise, it gets removed.
//PARAMS:
//  element: the favorite icon the user clicked
//RETURNS:
//none
function toggleFavorite(element) {
    if (element.getAttribute('selected') == 'false') {
        element.setAttribute('selected', 'true');
        nasa_id = modal.getAttribute('nasa_id');
        favorites = JSON.parse(localStorage.getItem('favorites'));
        favorites.push(nasa_id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        localStorage.setItem(nasa_id, sessionStorage.getItem(nasa_id));
    }
    else {
        element.setAttribute('selected', 'false');
        nasa_id = modal.getAttribute('nasa_id');
        favorites = JSON.parse(localStorage.getItem('favorites'));
        var filtered = favorites.filter(function (value, index, arr) {
            return value != nasa_id;
        })
        localStorage.setItem('favorites', JSON.stringify(filtered));
        localStorage.removeItem(nasa_id);
        if (favoriteGrid.style.display != "none") {
            showFavorites();
        }
    }

}
//This shouldn't happen, but it's in the case an image is not found.
//It just replaces the source of the image with a not-found image.
//PARAMS:
//  img: the image element whose source is bad 
//RETURNS:
//  none
function imgNotFound(img) {
    nasa_id = img.firstChild.className;
    img.src = "images/notfound-01.png"
}
//This is the function that shows data for an element the user clicks on.
//It shows the requested data in the displayed modal.
//PARAMS:
//  element: the element the user clicked on (and wants more data on)
//RETURNS:
//  none
function showData(element) {
    console.log("Hello");
    media_type = element.getAttribute('media-type');
    nasa_id = element.id;
    data = JSON.parse(sessionStorage.getItem(nasa_id));
    modal.setAttribute('nasa_id', nasa_id);
    modalTitle.textContent = data.title;
    if (data.title != data.description) {
        modalDescription.textContent = data.description;
    }
    modalCenter.textContent = data.center;
    modalDateCreated.textContent = data.date_created;
    modalKeywords.textContent = data.keywords.toString();
    if (!localStorage.getItem(nasa_id)) {
        favoriteIcon.setAttribute('selected', 'false');
    }
    else {
        favoriteIcon.setAttribute('selected', 'true');
    }
    switch (media_type) {
        case "image":
            var src = "https://images-assets.nasa.gov/image/" +
                nasa_id + "/" + nasa_id + "~thumb.jpg";
            modalImage.src = src;
            modalImage.setAttribute('nasa_id', nasa_id);
            modalImage.style.display = "block";
            break;
        case "video":
            var src = "https://images-assets.nasa.gov/video/" +
                nasa_id + "/" + nasa_id + "~medium.mp4";
            modalVideoSource.setAttribute('src', src);
            modalVideoSource.setAttribute('nasa_id', nasa_id);
            modalVideo.load();
            modalVideo.play();
            modalVideo.style.display = "block";
            break;
        case "audio":
            var src = "https://images-assets.nasa.gov/audio/" +
                nasa_id + "/" + nasa_id + "~orig.wav";
            modalAudioSource.setAttribute('src', src);
            modalAudioSource.setAttribute('nasa_id', nasa_id);
            modalAudio.load();
            modalAudio.play();
            modalAudio.style.display = "block";
            break;
        default:
            console.log(media_type);
            break;
    }
    modal.style.display = "block";

}
//The nasa assets aren't super clean. Media can exist in different formats across collections
//This is a problem, because we retrieve the assets from nasa in hardcoded formats
//These functions are sort of a small catch for that. If one format doesn't work, it will try another.
//It's not the best solution, because my code design isn't great, but sometimes it works.
function checkImageSource(element) {
    nasa_id = element.nasa_id;
    element.setAttribute('onerror', 'imgNotFound(this)');
    element.src = "https://images-assets.nasa.gov/image/" +
        nasa_id + "/" + nasa_id + "~medium.jpg";
}
function checkVideoSource(element) {
    nasa_id = element.nasa_id;
    element.onerror = function () { };
    element.src = "https://images-assets.nasa.gov/video/" +
        nasa_id + "/" + nasa_id + "~orig.wav";
    element.parentElement.load();
    element.parentElement.play();
}
function checkAudioSource(element) {
    nasa_id = element.nasa_id;
    element.onerror = function () { };
    element.src = "https://images-assets.nasa.gov/audio/" +
        nasa_id + "/" + nasa_id + "~orig.mp3";
    element.parentElement.load();
    element.parentElement.play();
}
//The function to call after pressing the find similar button
//PARAMS:
//  none
//RETURNS:
//  none
function findSimilar() {
    var keywords = JSON.parse(sessionStorage.getItem(nasa_id)).keywords.toString();
    var searchKeywords = "https://images-api.nasa.gov/search?keywords=" + keywords;
    clearGrid(grid);
    sendHTTP(searchKeywords, parseResponse);
    clearModal();
}
//This gets run if something goes wrong
function alert() {
    document.getElementById("metadata").textContent = "Something went wrong trying to display this!"
}
//This parses the search and turns into text to send in a NASA http request
//PARAMS:
//  none
//RETURNS:
//  final: the http request to send to the nasa server
function parseSearch() {
    var initial = jQuery('#searchform').val();
    var final = "https://images-api.nasa.gov/search?";
    //check each of the input and optional searches and if they're not empty, include them
    if (initial != "") {
        final += "&q=" + initial;
    }
    if (searchStartDateText != "") {
        final += "&year_start=" + searchStartDateText;
    }
    if (searchEndDateText != "") {
        final += "&year_end=" + searchEndDateText;
    }
    if (searchCenterText != "") {
        final += "&center=" + searchCenterText;
    }
    if (searchKeywordsText != "") {
        final += "&keywords=" + searchKeywordsText;
    }
    //If user has entered no fields, return a null so an error gets passed
    if (final === "https://images-api.nasa.gov/search?") {
        return null;
    }
    prevLink = final;
    return final;
}