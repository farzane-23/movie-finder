const movieList = document.getElementById("movieList");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const emptyState = document.getElementById("emptyState");
const pagination = document.getElementById("pagination");

const params = new URLSearchParams(window.location.search);
const page = Number(params.get("page")) || 1;

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const suggestionsBox = document.getElementById("suggestions");
const genreSelect = document.getElementById("genreSelect");

async function getPopularMovies() {
    loading.classList.remove("hidden");
    error.classList.add("hidden");
    emptyState.classList.add("hidden");

    try {
        const response = await fetch(
            `${API_BASE_URL}/movie/popular?language=en-US&page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    accept: "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to get movies from TMDB");
        }

        const data = await response.json();

        displayMovies(data.results);
        displayPagination(data.total_pages);

        if (!data.results || data.results.length === 0) {
            emptyState.classList.remove("hidden");
        }

    } catch (err) {
        console.error(err);
        error.textContent = "Something went wrong. Please try again.";
        error.classList.remove("hidden");

    } finally {
        loading.classList.add("hidden");
    }
}


function displayMovies(movies) {
    movieList.innerHTML = "";

    movies.forEach(movie => {
        const card = document.createElement("div");
        card.classList.add("movie-card");

        const poster = movie.poster_path
            ? `${IMAGE_BASE_URL}${movie.poster_path}`
            : "https://placehold.co/300x450?text=No+Poster";

        const rating = Number(movie.vote_average || 0).toFixed(1);

        const releaseYear = movie.release_date
            ? movie.release_date.slice(0, 4)
            : "Unknown";

        card.innerHTML = `
            <img src="${poster}" alt="${movie.title}"
                 onerror="this.src='https://placehold.co/300x450?text=No+Poster'">

            <h3>${movie.title}</h3>

            <p>
                <span>★</span> ${rating}
                <span class="movie-year">${releaseYear}</span>
            </p>
        `;

        card.addEventListener("click", function () {
            window.location.href = `details.html?id=${movie.id}`;
        });

        movieList.appendChild(card);
    });
}


function displayPagination(totalPages) {
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    const previousButton = document.createElement("button");
    previousButton.textContent = "Previous";
    previousButton.disabled = page <= 1;

    previousButton.addEventListener("click", function () {
        window.location.href = `index.html?page=${page - 1}`;
    });

    const pageText = document.createElement("span");
    pageText.textContent = `Page ${page} of ${totalPages}`;

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = page >= totalPages;

    nextButton.addEventListener("click", function () {
        window.location.href = `index.html?page=${page + 1}`;
    });

    pagination.append(previousButton, pageText, nextButton);
}


function searchMovies() {
    const query = searchInput.value.trim();

    if (!query) return;

    suggestionsBox.innerHTML = "";

    window.location.href =
        `search.html?query=${encodeURIComponent(query)}&page=1`;
}

searchButton.addEventListener("click", searchMovies);

searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchMovies();
    }
});


let suggestionTimer;

searchInput.addEventListener("input", function () {
    clearTimeout(suggestionTimer);

    const query = searchInput.value.trim();

    if (query.length < 2) {
        suggestionsBox.innerHTML = "";
        return;
    }

    suggestionTimer = setTimeout(async function () {
        try {
            const response = await fetch(
                `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`,
                {
                    headers: {
                        Authorization: `Bearer ${API_TOKEN}`,
                        accept: "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Suggestions request failed");
            }

            const data = await response.json();

            suggestionsBox.innerHTML = "";

            data.results.slice(0, 5).forEach(movie => {
                const item = document.createElement("div");
                item.classList.add("suggestion-item");

                const poster = movie.poster_path
                    ? `${IMAGE_BASE_URL}${movie.poster_path}`
                    : "https://placehold.co/50x75?text=No+Poster";

                item.innerHTML = `
                    <img src="${poster}" alt="">
                    <div>
                        <strong>${movie.title}</strong>
                        <small>
                            ${movie.release_date
                                ? movie.release_date.slice(0, 4)
                                : "Unknown"}
                        </small>
                    </div>
                `;

                item.addEventListener("click", function () {
                    window.location.href = `details.html?id=${movie.id}`;
                });

                suggestionsBox.appendChild(item);
            });

        } catch (err) {
            console.error("Suggestions error:", err);
        }
    }, 400);
});


async function getGenres() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/genre/movie/list?language=en-US`,
            {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    accept: "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load genres");
        }

        const data = await response.json();

        data.genres.forEach(genre => {
            const option = document.createElement("option");
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });

    } catch (err) {
        console.error(err);
    }
}


genreSelect.addEventListener("change", function () {
    const genreId = genreSelect.value;

    if (!genreId) return;

    const genreName =
        genreSelect.options[genreSelect.selectedIndex].text;

    window.location.href =
        `genre.html?id=${genreId}&name=${encodeURIComponent(genreName)}`;
});


getPopularMovies();
getGenres();