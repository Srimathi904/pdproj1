/* =====================================================
   CINEFLIX
   Live Movie Website
   TMDB API + YouTube Trailers
===================================================== */


/* =====================================================
   API CONFIGURATION
===================================================== */

const API_KEY = "YOUR_TMDB_API_KEY";

const API_URL = "https://api.themoviedb.org/3";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const BACKDROP_URL = "https://image.tmdb.org/t/p/original";


/* =====================================================
   DOM ELEMENTS
===================================================== */

const trendingMovies =
    document.getElementById("trendingMovies");

const popularMovies =
    document.getElementById("popularMovies");

const genreMovies =
    document.getElementById("genreMovies");

const searchResults =
    document.getElementById("searchResults");

const searchSection =
    document.getElementById("searchResultsSection");

const searchTitle =
    document.getElementById("searchTitle");

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const searchToggle =
    document.getElementById("searchToggle");

const searchBox =
    document.getElementById("searchBox");

const movieModal =
    document.getElementById("movieModal");

const closeModal =
    document.getElementById("closeModal");

const modalPoster =
    document.getElementById("modalPoster");

const modalBackdrop =
    document.getElementById("modalBackdrop");

const modalTitle =
    document.getElementById("modalTitle");

const modalRating =
    document.getElementById("modalRating");

const modalYear =
    document.getElementById("modalYear");

const modalLanguage =
    document.getElementById("modalLanguage");

const modalOverview =
    document.getElementById("modalOverview");

const trailerBtn =
    document.getElementById("trailerBtn");

const trailerContainer =
    document.getElementById("trailerContainer");

const trailerFrame =
    document.getElementById("trailerFrame");

const modalListBtn =
    document.getElementById("modalListBtn");

const emptyList =
    document.getElementById("emptyList");


/* =====================================================
   VARIABLES
===================================================== */

let currentMovie = null;

let myList =
    JSON.parse(localStorage.getItem("cineflixMyList")) || [];


/* =====================================================
   API HELPER
===================================================== */

async function fetchAPI(endpoint) {

    try {

        const response = await fetch(
            `${API_URL}${endpoint}&api_key=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error("API request failed");
        }

        return await response.json();

    } catch (error) {

        console.error(error);

        return null;
    }
}


/* =====================================================
   LOAD TRENDING
===================================================== */

async function loadTrending() {

    if (API_KEY === "YOUR_TMDB_API_KEY") {

        showAPIMessage(trendingMovies);

        return;
    }

    const data =
        await fetchAPI(
            "/trending/movie/week?language=en-US"
        );

    if (!data) return;

    renderMovies(
        data.results,
        trendingMovies,
        true
    );
}


/* =====================================================
   LOAD POPULAR
===================================================== */

async function loadPopular() {

    if (API_KEY === "YOUR_TMDB_API_KEY") {

        showAPIMessage(popularMovies);

        return;
    }

    const data =
        await fetchAPI(
            "/movie/popular?language=en-US&page=1"
        );

    if (!data) return;

    renderMovies(
        data.results,
        popularMovies
    );
}


/* =====================================================
   SEARCH MOVIES
===================================================== */

async function searchMovies() {

    const query =
        searchInput.value.trim();

    if (!query) return;

    if (API_KEY === "YOUR_TMDB_API_KEY") {

        alert(
            "Please add your TMDB API key inside script.js"
        );

        return;
    }

    const data =
        await fetchAPI(
            `/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`
        );

    if (!data) return;

    searchSection.classList.add("show");

    searchTitle.textContent =
        `Results for "${query}"`;

    renderMovies(
        data.results,
        searchResults
    );

    searchSection.scrollIntoView({
        behavior: "smooth"
    });
}


/* =====================================================
   LOAD GENRE
===================================================== */

async function loadGenre(genreId) {

    if (API_KEY === "YOUR_TMDB_API_KEY") {

        alert(
            "Please add your TMDB API key inside script.js"
        );

        return;
    }

    const data =
        await fetchAPI(
            `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&language=en-US&page=1`
        );

    if (!data) return;

    renderMovies(
        data.results,
        genreMovies
    );

    genreMovies.scrollIntoView({
        behavior: "smooth"
    });
}


/* =====================================================
   RENDER MOVIES
===================================================== */

function renderMovies(
    movies,
    container,
    slider = false
) {

    container.innerHTML = "";

    if (!movies || movies.length === 0) {

        container.innerHTML =
            `<p class="empty-list">
                No movies found.
            </p>`;

        return;
    }

    movies.forEach(movie => {

        if (!movie.poster_path) return;

        const card =
            document.createElement("div");

        card.className = "movie-card";

        const isInList =
            myList.some(
                item => item.id === movie.id
            );

        card.innerHTML = `

            <button
                class="list-btn ${isInList ? "active" : ""}"
                data-id="${movie.id}"
            >
                ${isInList ? "✓" : "+"}
            </button>

            <img
                class="movie-poster"
                src="${IMAGE_URL}${movie.poster_path}"
                alt="${escapeHTML(movie.title)}"
                loading="lazy"
            >

            <div class="movie-info">

                <h3>
                    ${escapeHTML(movie.title)}
                </h3>

                <div class="movie-meta">

                    <span class="rating">
                        ⭐ ${movie.vote_average
                            ? movie.vote_average.toFixed(1)
                            : "N/A"}
                    </span>

                    <span>
                        ${
                            movie.release_date
                            ? movie.release_date.substring(0, 4)
                            : "N/A"
                        }
                    </span>

                </div>

            </div>
        `;

        card.addEventListener(
            "click",
            function(event) {

                if (
                    event.target.classList.contains(
                        "list-btn"
                    )
                ) {
                    return;
                }

                openMovie(movie);
            }
        );


        const listButton =
            card.querySelector(".list-btn");

        listButton.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

                toggleMyList(movie);
            }
        );


        container.appendChild(card);

    });
}


/* =====================================================
   OPEN MOVIE MODAL
===================================================== */

async function openMovie(movie) {

    currentMovie = movie;

    movieModal.classList.add("show");

    modalPoster.src =
        movie.poster_path
        ? IMAGE_URL + movie.poster_path
        : "";

    modalBackdrop.style.backgroundImage =
        movie.backdrop_path
        ? `url("${BACKDROP_URL}${movie.backdrop_path}")`
        : "none";

    modalTitle.textContent =
        movie.title || "Unknown Movie";

    modalRating.textContent =
        `⭐ ${
            movie.vote_average
            ? movie.vote_average.toFixed(1)
            : "N/A"
        }`;

    modalYear.textContent =
        movie.release_date
        ? movie.release_date.substring(0, 4)
        : "N/A";

    modalLanguage.textContent =
        movie.original_language
        ? movie.original_language.toUpperCase()
        : "N/A";

    modalOverview.textContent =
        movie.overview ||
        "No description available.";

    trailerContainer.classList.remove("show");

    trailerFrame.src = "";

    updateModalListButton();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   GET TRAILER
===================================================== */

async function watchTrailer() {

    if (!currentMovie) return;

    if (API_KEY === "YOUR_TMDB_API_KEY") {

        alert(
            "Please add your TMDB API key inside script.js"
        );

        return;
    }

    trailerBtn.textContent =
        "Loading...";

    const data =
        await fetchAPI(
            `/movie/${currentMovie.id}/videos?language=en-US`
        );

    trailerBtn.textContent =
        "▶ Watch Trailer";

    if (!data || !data.results) {

        alert(
            "Trailer not available for this movie."
        );

        return;
    }

    const trailer =
        data.results.find(
            video =>
                video.site === "YouTube" &&
                video.type === "Trailer"
        ) ||
        data.results.find(
            video =>
                video.site === "YouTube"
        );

    if (!trailer) {

        alert(
            "Trailer not available."
        );

        return;
    }

    trailerFrame.src =
        `https://www.youtube.com/embed/${trailer.key}`;

    trailerContainer.classList.add("show");

    trailerContainer.scrollIntoView({
        behavior: "smooth"
    });
}


/* =====================================================
   MY LIST
===================================================== */

function toggleMyList(movie) {

    const index =
        myList.findIndex(
            item => item.id === movie.id
        );

    if (index === -1) {

        myList.push(movie);

    } else {

        myList.splice(index, 1);
    }

    localStorage.setItem(
        "cineflixMyList",
        JSON.stringify(myList)
    );

    renderMyList();

    updateAllCards();

    updateModalListButton();
}


function renderMyList() {

    if (myList.length === 0) {

        emptyList.style.display =
            "block";

        return;
    }

    emptyList.style.display =
        "none";

    renderMovies(
        myList,
        document.getElementById(
            "myListMovies"
        )
    );
}


function updateModalListButton() {

    if (!currentMovie) return;

    const exists =
        myList.some(
            movie => movie.id === currentMovie.id
        );

    modalListBtn.textContent =
        exists
        ? "✓ Added to My List"
        : "+ My List";
}


function updateAllCards() {

    loadTrending();

    loadPopular();

    renderMyList();

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;
}


/* =====================================================
   API MESSAGE
===================================================== */

function showAPIMessage(container) {

    container.innerHTML = `

        <div style="
            padding:30px;
            color:#aaa;
            grid-column:1/-1;
        ">

            <h3 style="color:white;margin-bottom:10px;">
                Connect TMDB API
            </h3>

            <p>
                Add your TMDB API key inside
                <strong>script.js</strong>
                to load live movie data.
            </p>

        </div>
    `;
}


/* =====================================================
   EVENT LISTENERS
===================================================== */


/* Search icon */

searchToggle.addEventListener(
    "click",
    () => {

        searchBox.classList.toggle(
            "show"
        );

        searchInput.focus();

    }
);


/* Search button */

searchBtn.addEventListener(
    "click",
    searchMovies
);


/* Search Enter */

searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            searchMovies();
        }

    }
);


/* Close modal */

closeModal.addEventListener(
    "click",
    () => {

        movieModal.classList.remove(
            "show"
        );

        trailerFrame.src = "";
    }
);


/* Click outside modal */

movieModal.addEventListener(
    "click",
    event => {

        if (event.target === movieModal) {

            movieModal.classList.remove(
                "show"
            );

            trailerFrame.src = "";
        }

    }
);


/* Escape key */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            movieModal.classList.remove(
                "show"
            );

            trailerFrame.src = "";
        }

    }
);


/* Trailer */

trailerBtn.addEventListener(
    "click",
    watchTrailer
);


/* Modal My List */

modalListBtn.addEventListener(
    "click",
    () => {

        if (currentMovie) {
            toggleMyList(currentMovie);
        }

    }
);


/* Genre buttons */

document
    .querySelectorAll(".genre-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".genre-btn")
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );

                button.classList.add(
                    "active"
                );

                loadGenre(
                    button.dataset.genre
                );
            }
        );

    });


/* Trending slider */

document
    .getElementById("trendNext")
    .addEventListener(
        "click",
        () => {

            trendingMovies.scrollBy({
                left: 500,
                behavior: "smooth"
            });

        }
    );


document
    .getElementById("trendPrev")
    .addEventListener(
        "click",
        () => {

            trendingMovies.scrollBy({
                left: -500,
                behavior: "smooth"
            });

        }
    );


/* Explore button */

document
    .getElementById("exploreBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("movies")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );


/* More info */

document
    .getElementById("infoBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("trending")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );


/* =====================================================
   INITIALIZE
===================================================== */

loadTrending();

loadPopular();

renderMyList();