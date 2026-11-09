const movieDetails = document.getElementById("movieDetails");

async function getMovieDetails() {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    if (!movieId) {
        movieDetails.innerHTML = "<p>Movie ID not found!</p>";
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/movie/${movieId}?language=en-US`,
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

        const poster = movie.poster_path
            ? `${IMAGE_BASE_URL}${movie.poster_path}`
            : "https://placehold.co/300x450?text=No+Poster";

        movieDetails.innerHTML = `
            <div class="details-card">
                <img src="${poster}" alt="${movie.title}">
                <div>
                    <h1>${movie.title}</h1>
                    <p><strong>Overview:</strong> ${movie.overview || "No description available."}</p>
                    <p><strong>Release Date:</strong> ${movie.release_date || "Unknown"}</p>
                    <p><strong>Rating:</strong> ${Number(movie.vote_average || 0).toFixed(1)}</p>
                    <p><strong>Runtime:</strong> ${movie.runtime || "Unknown"} minutes</p>
                    <p><strong>Genres:</strong> ${(movie.genres || []).map(g => g.name).join(", ") || "Unknown"}</p>
                </div>
            </div>
        `;

    } catch (err) {
        console.error(err);
        movieDetails.innerHTML = "<p>Something went wrong. Please try again.</p>";
    }
}

getMovieDetails();