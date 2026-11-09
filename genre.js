const movieList = document.getElementById("movieList");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const emptyState = document.getElementById("emptyState");
const genreTitle = document.getElementById("genreTitle");
const pagination = document.getElementById("pagination");

const params = new URLSearchParams(window.location.search);
const genreId = params.get("id");
const page = Number(params.get("page")) || 1;
const genreName = params.get("name");

async function getGenreMovies() {
    if (!genreId) {
        genreTitle.textContent = "Genre not found";
        loading.classList.add("hidden");
        emptyState.classList.remove("hidden");
        return;
    }

    genreTitle.textContent = genreName || "Genre Movies";
    loading.classList.remove("hidden");
    error.classList.add("hidden");
    emptyState.classList.add("hidden");

    try {
        const response = await fetch(
            `${API_BASE_URL}/discover/movie?with_genres=${genreId}&language=en-US&page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    accept: "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load genre movies");
        }

        const data = await response.json();

        displayMovies(data.results);
        displayPagination(data.total_pages);

        if (data.results.length === 0) {
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

        card.innerHTML = `
            <img src="${poster}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Rating: ${movie.vote_average.toFixed(1)}</p>
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
        window.location.href = `genre.html?id=${genreId}&name=${encodeURIComponent(genreName || "")}&page=${page - 1}`;
    });

    const pageText = document.createElement("span");
    pageText.textContent = `Page ${page} of ${totalPages}`;

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = page >= totalPages;

    nextButton.addEventListener("click", function () {
        window.location.href = `genre.html?id=${genreId}&name=${encodeURIComponent(genreName || "")}&page=${page + 1}`;
    });

    pagination.append(previousButton, pageText, nextButton);
}

getGenreMovies();