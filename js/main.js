var API_BASE_URL = "https://api.spotify.com";
var API_VERSION = "v1";

/** Helpers **/

function hideElement(elem) {
    if (elem.style.display !== "none") {
        elem.style.display = "none";
    }
}

function showElement(elem) {
    elem.style.display = "inherit";
}

// Helper to get the url hash params as an object
function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

/** Main **/

var params = getHashParams();
var access_token = params.access_token;
var defaultArtistID = "4dpARuHxo51G3z768sgnrY";

var loginElem = document.getElementById("login-container");
var appElem = document.getElementById("app-container");

// Artist
var artistName = document.getElementById("artistName");
var artistFollowers = document.getElementById("artistFollowers");
var artistPic = document.getElementById("profilePic");
var openProfileButton = document.getElementById("open-button");

// Top Tracks
var topTracks = document.getElementById("topTrackSection");
var topTrackList = document.getElementById("topTrackSectionList");
var topTrackPlayer = document.getElementById("topTrackPlayer");

// Related Artists
var relatedArtists = document.getElementById("relatedArtistSection");

function logout() {
    hideElement(appElem);
    window.location.hash = "";
    topTrackPlayer.pause();
    topTrackPlayer.setAttribute("src", "");
    showElement(loginElem);
}

if (access_token) {
    getArtist(defaultArtistID);
    hideElement(loginElem);
}

function displayArtist(data) {
    artistPic.innerHTML = "<img src='"+data.images[2].url+"' alt='"+data.name+"'>";
    artistName.innerText = data.name;
    artistFollowers.innerText = data.followers.total + " followers";
    openProfileButton.setAttribute("href", data.external_urls.spotify);
}

function displayTopTracks(data) {
    if (data.tracks.length > 0) {
        var content = data.tracks.map(function(track, index){
            var item = '<li data-preview="'+track.preview_url+'"><div class="trackItem"><span class="trackNum">' + (index + 1) + '.</span><div class="trackDesc"><div class="trackTitle">' + track.name + '</div><div class="trackAlbum">' + track.album.name + '</div></div></div></li>';
            return item;
        });
        topTrackList.innerHTML = "<ul>"+content.join("")+"</ul>";
        var lis = topTrackList.querySelectorAll("li");

        for (i = 0; i < lis.length; ++i) {
            lis[i].addEventListener("click", onTrackClick);
        }
    } else {
        hideElement(topTrackPlayer);
        topTrackList.innerHTML = "<div class='tracksNotFoundMsg'>Oups!! No tracks found.</div>";
    }
}

function displayRelatedArtists(data) {
    if (data.artists.length > 0) {
        var content = data.artists.map(function(artist, index){
            var item = '<div class="artistItem" data-artistid="'+artist.id+'"><div class="artistPic"><img src="'+artist.images[artist.images.length-1].url+'" alt="'+artist.name+'"></div><div class="artistDesc"><div class="artistTitle">'+artist.name+'</div></div></div>';
            return item;
        });
        relatedArtists.innerHTML = content.join("");
        var list = relatedArtists.querySelectorAll(".artistItem");

        for (i = 0; i < list.length; ++i) {
            list[i].addEventListener("click", onArtistClick);
        }
    } else {
        relatedArtists.innerHTML = "<div class='artistNotFoundMsg'>Oups!! No artists found.</div>";
    }
}

function onTrackClick(evt) {
    topTrackPlayer.setAttribute("src", evt.currentTarget.dataset.preview);
    topTrackPlayer.play();
}

function onArtistClick(evt) {
    getArtist(evt.currentTarget.dataset.artistid);
}

function getArtist(artistID) {
    hideElement(appElem);
    topTrackPlayer.setAttribute("src", "");
    topTrackPlayer.pause();
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200 && httpRequest.response) {
                showElement(appElem);
                console.log(httpRequest.responseText);
                var resp = JSON.parse(httpRequest.responseText);
                displayArtist(resp);
                getArtistTopTracks(artistID);
                getRelatedArtists(artistID);
            } else {
                console.log("There was a problem with the request.");
                logout();
            }
        }
    };
    httpRequest.open("GET", API_BASE_URL+"/"+API_VERSION+"/artists/"+artistID);
    httpRequest.setRequestHeader("Authorization", "Bearer " + access_token);
    httpRequest.send();
}

function getArtistTopTracks(artistID) {
    hideElement(topTracks);
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200 && httpRequest.response) {
                console.log(httpRequest.responseText);
                var resp = JSON.parse(httpRequest.responseText);
                displayTopTracks(resp);
                showElement(topTracks);
            } else {
                console.log("There was a problem with the request.");
                logout();
            }
        }
    };
    httpRequest.open("GET", API_BASE_URL+"/"+API_VERSION+"/artists/"+artistID+"/top-tracks?country=US");
    httpRequest.setRequestHeader("Authorization", "Bearer " + access_token);
    httpRequest.send();
}

function getRelatedArtists(artistID) {
    hideElement(relatedArtists);
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200 && httpRequest.response) {
                console.log(httpRequest.responseText);
                var resp = JSON.parse(httpRequest.responseText);
                displayRelatedArtists(resp);
                showElement(relatedArtists);
            } else {
                console.log("There was a problem with the request.");
                logout();
            }
        }
    };
    httpRequest.open("GET", API_BASE_URL+"/"+API_VERSION+"/artists/"+artistID+"/related-artists");
    httpRequest.setRequestHeader("Authorization", "Bearer " + access_token);
    httpRequest.send();
}

document.getElementById("logout-button").addEventListener("click", function() {
    logout();
});

document.getElementById("login-button").addEventListener("click", function() {
    var client_id = "8a2149a4a65349d4ada49cc519815eab"; // client id
    var redirect_uri = (window.location.hash.length > 0) ? window.location.href.replace(window.location.hash,"") : window.location.href.replace("#",""); // redirect uri
    var url = "https://accounts.spotify.com/authorize";
    url += "?response_type=token";
    url += "&client_id=" + encodeURIComponent(client_id);
    url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
    window.location = url;
}, false);