const movieDetails = document.getElementById("movieDetails");
const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");

async function getMovieDetails() {
    if (!movieId) {
        showError("Movie ID not found!");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/movie/${movieId}?language=en-US&append_to_response=credits,images`,
            {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    accept: "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load movie details");
        }

        const movie = await response.json();

        displayMovieDetails(movie);

    } catch (err) {
        console.error(err);
        showError("Something went wrong. Please try again.");
    }
}

function showError(message) {
    movieDetails.innerHTML = `
        <p class="message">${message}</p>
    `;
}

function displayMovieDetails(movie) {
    const poster = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : "https://placehold.co/500x750?text=No+Poster";

    const rating = Number(movie.vote_average || 0).toFixed(1);

    const genres = movie.genres || [];

    const director = (movie.credits?.crew || [])
        .find(person => person.job === "Director");

    const writers = (movie.credits?.crew || [])
        .filter(person =>
            person.department === "Writing"
        )
        .slice(0, 3);

    const cast = (movie.credits?.cast || []).slice(0, 6);

    const stills = (movie.images?.backdrops || []).slice(0, 3);

    const runtime = movie.runtime
        ? `${movie.runtime} min`
        : "Unknown";

    const releaseDate = movie.release_date || "Unknown";

    movieDetails.innerHTML = `
        <section class="details-main">

            <div class="details-heading">
                <div>
                    <h1>${movie.title}</h1>
                    <p class="details-meta">
                        ${releaseDate} · ${runtime}
                    </p>
                </div>

                <div class="details-rating">
                    <span>★</span>
                    <strong>${rating}</strong>
                    <small>/ 10</small>
                </div>
            </div>

            <div class="details-layout">

                <img
                    class="details-poster"
                    src="${poster}"
                    alt="${movie.title}"
                >

                <div class="details-information">

                    <div class="details-genres">
                        <strong>Genre</strong>
                        <div class="genre-tags">
                            ${
                                genres.length
                                    ? genres.map(genre =>
                                        `<span>${genre.name}</span>`
                                      ).join("")
                                    : "<span>Unknown</span>"
                            }
                        </div>
                    </div>

                    <div class="details-overview">
                        <h3>Plot</h3>
                        <p>
                            ${movie.overview || "No description available."}
                        </p>
                    </div>

                    <div class="details-person">
                        <strong>Director</strong>
                        <span>
                            ${director ? director.name : "Unknown"}
                        </span>
                    </div>

                    <div class="details-person">
                        <strong>Writers</strong>
                        <span>
                            ${
                                writers.length
                                    ? writers.map(person => person.name).join(" · ")
                                    : "Unknown"
                            }
                        </span></div>

                    <div class="details-person">
                        <strong>Runtime</strong>
                        <span>${runtime}</span>
                    </div>

                </div>
            </div>

            ${
                stills.length
                    ? `
                        <section class="movie-stills">
                            <h2>Movie Images</h2>
                            <div class="stills-grid">
                                ${stills.map(still => `
                                    <img
                                        src="${IMAGE_BASE_URL}${still.file_path}"
                                        alt="${movie.title} scene"
                                    >
                                `).join("")}
                            </div>
                        </section>
                    `
                    : ""
            }

            ${
                cast.length
                    ? `
                        <section class="cast-section">
                            <h2>Cast</h2>

                            <div class="cast-grid">
                                ${cast.map(actor => {
                                    const profile = actor.profile_path
                                        ? `${IMAGE_BASE_URL}${actor.profile_path}`
                                        : "https://placehold.co/180x220?text=No+Image";

                                    return `
                                        <div class="cast-card">
                                            <img
                                                src="${profile}"
                                                alt="${actor.name}"
                                            >
                                            <h4>${actor.name}</h4>
                                            <p>${actor.character || ""}</p>
                                        </div>
                                    `;
                                }).join("")}
                            </div>
                        </section>
                    `
                    : ""
            }

        </section>
    `;
}


const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const suggestionsBox = document.getElementById("suggestions");

function searchMovies() {
    const query = searchInput.value.trim();

    if (!query) return;

    window.location.href =
        `search.html?query=${encodeURIComponent(query)}&page=1`;
}

searchButton.addEventListener("click", searchMovies);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchMovies();
    }
});


let suggestionTimer;

searchInput.addEventListener("input", () => {
    clearTimeout(suggestionTimer);

    const query = searchInput.value.trim();

    if (query.length < 2) {
        suggestionsBox.innerHTML = "";
        return;
    }

    suggestionTimer = setTimeout(async () => {
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
                throw new Error("Search failed");
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
                    <img src="${poster}" alt=""><div>
                        <strong>${movie.title}</strong>
                        <small>
                            ${movie.release_date
                                ? movie.release_date.slice(0, 4)
                                : "Unknown"}
                        </small>
                    </div>
                `;

                item.addEventListener("click", () => {
                    window.location.href =
                        `details.html?id=${movie.id}`;
                });

                suggestionsBox.appendChild(item);
            });

        } catch (err) {
            console.error(err);
        }
    }, 400);
});

//loadddddddddddddd
async function getGenres() {
    const genreSelect = document.getElementById("genreSelect");

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


document.getElementById("genreSelect")
    .addEventListener("change", function () {
        const genreId = this.value;

        if (!genreId) return;

        const genreName =
            this.options[this.selectedIndex].text;

        window.location.href =
            `genre.html?id=${genreId}&name=${encodeURIComponent(genreName)}`;
    });


getMovieDetails();
getGenres();