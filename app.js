const DEFAULT_CONFIG = {
  tmdbApiKey: "",
  tmdbPages: 2,
  tmdbLanguage: "en-US",
  tmdbRegion: "",
  enablePwa: true
};

const CONFIG = {
  ...DEFAULT_CONFIG,
  ...(window.CINEPULSE_CONFIG || {})
};

const TMDB_API_KEY = String(CONFIG.tmdbApiKey || "").trim();
const TMDB_API_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w780";
const TMDB_LANGUAGE = CONFIG.tmdbLanguage || "en-US";
const TMDB_REGION = CONFIG.tmdbRegion || "";
const tmdbPagesValue = Number(CONFIG.tmdbPages);
const TMDB_PAGES = Number.isFinite(tmdbPagesValue)
  ? clamp(tmdbPagesValue, 1, 5)
  : DEFAULT_CONFIG.tmdbPages;
const TMDB_ENABLED = Boolean(TMDB_API_KEY);

const DATASET_ENDPOINTS = [
  "data/movies.json",
  "https://cdn.jsdelivr.net/gh/erik-sytnyk/movies-list@master/db.json",
  "https://raw.githubusercontent.com/erik-sytnyk/movies-list/master/db.json"
];

const FALLBACK_POSTER = "https://placehold.co/640x360/10273b/e8f1f7?text=No+Poster";
const PAGE_SIZE = 24;

const STORAGE_KEYS = {
  favorites: "cinepulse-favorites",
  ratings: "cinepulse-user-ratings",
  signals: "cinepulse-signals"
};

const FALLBACK_MOVIES = [
  {
    id: "fb-inception",
    title: "Inception",
    year: 2010,
    runtime: 148,
    genres: ["Action", "Sci-Fi", "Thriller"],
    director: "Christopher Nolan",
    actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"],
    plot: "A thief enters layered dreams to plant an idea where no one can see it coming.",
    posterUrl: "https://images-na.ssl-images-amazon.com/images/M/MV5BMjAxMzY3Njg2MV5BMl5BanBnXkFtZTcwOTI5OTM0Mw@@._V1_SX300.jpg"
  },
  {
    id: "fb-interstellar",
    title: "Interstellar",
    year: 2014,
    runtime: 169,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    director: "Christopher Nolan",
    actors: ["Matthew McConaughey", "Anne Hathaway"],
    plot: "Explorers chase a new home for humanity through wormholes, time, and sacrifice.",
    posterUrl: "https://images-na.ssl-images-amazon.com/images/M/MV5BMjIxMjgxMzEwNl5BMl5BanBnXkFtZTgwNzUxNjM3MjE@._V1_SX300.jpg"
  },
  {
    id: "fb-dark-knight",
    title: "The Dark Knight",
    year: 2008,
    runtime: 152,
    genres: ["Action", "Crime", "Drama"],
    director: "Christopher Nolan",
    actors: ["Christian Bale", "Heath Ledger"],
    plot: "Batman faces a chaotic villain whose games push Gotham to the edge.",
    posterUrl: "https://images-na.ssl-images-amazon.com/images/M/MV5BMTMxNTMwODM0Nl5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg"
  },
  {
    id: "fb-shawshank",
    title: "The Shawshank Redemption",
    year: 1994,
    runtime: 142,
    genres: ["Drama", "Crime"],
    director: "Frank Darabont",
    actors: ["Tim Robbins", "Morgan Freeman"],
    plot: "Hope and friendship endure inside prison walls where freedom feels impossible.",
    posterUrl: "https://images-na.ssl-images-amazon.com/images/M/MV5BODU4NTU4NjQxNl5BMl5BanBnXkFtZTgwOTU5NjQ4MDE@._V1_SX300.jpg"
  },
  {
    id: "fb-parasite",
    title: "Parasite",
    year: 2019,
    runtime: 132,
    genres: ["Drama", "Thriller", "Comedy"],
    director: "Bong Joon-ho",
    actors: ["Kang-ho Song", "Sun-kyun Lee"],
    plot: "A poor family slips into a wealthy household and sparks a razor-sharp class thriller.",
    posterUrl: "https://images-na.ssl-images-amazon.com/images/M/MV5BYWZjMjc3ZTktY2IxYi00Y2I2LTk2NzAtZDJmM2QyYzJjM2I3XkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg"
  },
  {
    id: "fb-lotr",
    title: "The Lord of the Rings: The Fellowship of the Ring",
    year: 2001,
    runtime: 178,
    genres: ["Adventure", "Drama", "Fantasy"],
    director: "Peter Jackson",
    actors: ["Elijah Wood", "Ian McKellen"],
    plot: "A fragile ring, a fellowship of heroes, and an epic journey into shadow.",
    posterUrl: "https://images-na.ssl-images-amazon.com/images/M/MV5BN2EyZjM3NjItYTAwMy00ZWQyLTljZGYtYzYwYzQ5NzQ3YzViXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg"
  }
];

const form = document.getElementById("discover-form");
const dataStatus = document.getElementById("data-status");
const searchInput = document.getElementById("search");
const genreOptions = document.getElementById("genre-options");
const selectedGenresView = document.getElementById("selected-genres");
const genreMatchSelect = document.getElementById("genre-match");
const sortSelect = document.getElementById("sort-by");
const directorFilterInput = document.getElementById("director-filter");
const actorFilterInput = document.getElementById("actor-filter");
const minMatchInput = document.getElementById("min-match");
const minMatchValue = document.getElementById("min-match-value");
const personalizeStrengthInput = document.getElementById("personalize-strength");
const personalizeValue = document.getElementById("personalize-value");
const hideSeenInput = document.getElementById("hide-seen");
const yearFromInput = document.getElementById("year-from");
const yearToInput = document.getElementById("year-to");
const runtimeMinInput = document.getElementById("runtime-min");
const runtimeMaxInput = document.getElementById("runtime-max");
const modeButtons = Array.from(document.querySelectorAll(".mode-btn"));
const surpriseButton = document.getElementById("surprise-btn");
const resetButton = document.getElementById("reset-btn");
const clearFavoritesButton = document.getElementById("clear-favorites");

const resultCount = document.getElementById("result-count");
const activeQuery = document.getElementById("active-query");
const emptyState = document.getElementById("empty-state");
const loadingState = document.getElementById("loading-state");
const resultsContainer = document.getElementById("results");
const scrollSentinel = document.getElementById("scroll-sentinel");

const favoritesContainer = document.getElementById("favorites-list");
const favoritesEmpty = document.getElementById("favorites-empty");
const movieCardTemplate = document.getElementById("movie-card-template");
const heroCatalogCount = document.getElementById("hero-catalog-count");
const heroVisibleCount = document.getElementById("hero-visible-count");
const heroFavoritesCount = document.getElementById("hero-favorites-count");
const heroModeLabel = document.getElementById("hero-mode-label");

const tasteStrength = document.getElementById("taste-strength");
const tasteSummary = document.getElementById("taste-summary");
const tasteTags = document.getElementById("taste-tags");

const trailerModal = document.getElementById("trailer-modal");
const trailerTitle = document.getElementById("trailer-title");
const trailerFrame = document.getElementById("trailer-frame");
const trailerMessage = document.getElementById("trailer-message");
const closeTrailerButton = document.getElementById("close-trailer");

const state = {
  allMovies: [],
  movieIndex: new Map(),
  filteredMovies: [],
  selectedGenres: new Set(),
  mode: "discover",
  currentPage: 0,
  totalPages: 0,
  isLoading: false,
  requestSerial: 0,
  lastFilters: null,
  tasteProfile: null,
  dataSource: "catalog",
  dataSourceMessage: ""
};

const favorites = loadFavoritesMap();
const userRatings = loadRatingsMap();
const signals = loadSignalsMap();

const debouncedSearch = debounce(runFilterPipeline, 280);

form.addEventListener("submit", handleApplyFilters);
searchInput.addEventListener("input", debouncedSearch);
modeButtons.forEach((button) => {
  button.addEventListener("click", () => switchMode(button.dataset.mode || "discover"));
});
minMatchInput.addEventListener("input", () => {
  minMatchValue.textContent = String(Number(minMatchInput.value));
  runFilterPipeline();
});
if (personalizeStrengthInput && personalizeValue) {
  personalizeStrengthInput.addEventListener("input", () => {
    personalizeValue.textContent = String(Number(personalizeStrengthInput.value));
    runFilterPipeline();
  });
}
if (hideSeenInput) {
  hideSeenInput.addEventListener("change", () => {
    runFilterPipeline();
  });
}
surpriseButton.addEventListener("click", handleSurprise);
resetButton.addEventListener("click", handleReset);
clearFavoritesButton.addEventListener("click", clearFavorites);
closeTrailerButton.addEventListener("click", closeTrailerModal);
trailerModal.addEventListener("click", (event) => {
  if (event.target instanceof HTMLElement && event.target.dataset.closeModal === "true") {
    closeTrailerModal();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !trailerModal.hidden) {
    closeTrailerModal();
  }
});

setupInfiniteScroll();
registerServiceWorker();
renderFavorites();
initialize();

async function initialize() {
  minMatchValue.textContent = String(Number(minMatchInput.value));
  if (personalizeStrengthInput && personalizeValue) {
    personalizeValue.textContent = String(Number(personalizeStrengthInput.value));
  }
  showDataStatus("Loading movie catalog...", "loading");

  const loadedMovies = await loadCatalogMovies();

  state.allMovies = loadedMovies;
  state.movieIndex = new Map(loadedMovies.map((movie) => [movie.id, movie]));
  updateHeroStats();

  const genres = collectGenres(loadedMovies);
  renderGenreOptions(genres);
  renderSelectedGenres();
  updateTasteProfile();

  if (loadedMovies.length === 0) {
    showDataStatus("Could not load catalog data.", "error");
    showEmptyState("Movie data is unavailable right now.");
    return;
  }

  const sourceLabel = state.dataSource || "catalog";
  const prefix = state.dataSourceMessage ? `${state.dataSourceMessage} ` : "";
  showDataStatus(`${prefix}Loaded ${loadedMovies.length} movies from ${sourceLabel}.`, "success");
  runFilterPipeline();
}

async function loadCatalogMovies() {
  state.dataSourceMessage = "";

  if (TMDB_ENABLED) {
    try {
      showDataStatus("Connecting to TMDB catalog...", "loading");
      const tmdbCatalog = await loadTmdbCatalog();
      if (tmdbCatalog.length > 0) {
        state.dataSource = "TMDB";
        return tmdbCatalog;
      }
      state.dataSourceMessage = "TMDB returned no results.";
    } catch (error) {
      state.dataSourceMessage = "TMDB unavailable.";
    }
  } else {
    state.dataSourceMessage = "TMDB key not configured.";
  }

  showDataStatus("Loading open movie catalog...", "loading");

  for (const endpoint of DATASET_ENDPOINTS) {
    try {
      const payload = await fetchJsonWithTimeout(endpoint, 15000);
      const sourceMovies = Array.isArray(payload.movies) ? payload.movies : [];
      const normalized = normalizeMovies(sourceMovies);
      if (normalized.length > 0) {
        state.dataSource = "Open dataset";
        return normalized;
      }
    } catch (error) {
      continue;
    }
  }

  state.dataSource = "Open dataset";
  return normalizeMovies(FALLBACK_MOVIES);
}

async function fetchJsonWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function loadTmdbCatalog() {
  const genreMap = await fetchTmdbGenres();
  const catalog = new Map();

  const categories = [
    { label: "Popular", path: "/movie/popular" },
    { label: "Top Rated", path: "/movie/top_rated" },
    { label: "Now Playing", path: "/movie/now_playing" },
    { label: "Upcoming", path: "/movie/upcoming" }
  ];

  for (const category of categories) {
    for (let page = 1; page <= TMDB_PAGES; page += 1) {
      try {
        const payload = await fetchTmdbPage(category.path, page);
        const results = Array.isArray(payload.results) ? payload.results : [];
        results.forEach((entry) => {
          const mapped = mapTmdbMovie(entry, genreMap, category.label);
          if (mapped) {
            catalog.set(mapped.id, mapped);
          }
        });
      } catch (error) {
        continue;
      }
    }
  }

  return normalizeMovies(Array.from(catalog.values()));
}

async function fetchTmdbPage(path, page) {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: TMDB_LANGUAGE,
    page: String(page)
  });

  if (TMDB_REGION) {
    params.set("region", TMDB_REGION);
  }

  const url = `${TMDB_API_BASE}${path}?${params.toString()}`;
  return fetchJsonWithTimeout(url, 15000);
}

async function fetchTmdbGenres() {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: TMDB_LANGUAGE
  });
  const url = `${TMDB_API_BASE}/genre/movie/list?${params.toString()}`;
  const payload = await fetchJsonWithTimeout(url, 15000);
  const genres = Array.isArray(payload.genres) ? payload.genres : [];
  const genreMap = new Map();
  genres.forEach((genre) => {
    if (genre && genre.id && genre.name) {
      genreMap.set(genre.id, genre.name);
    }
  });
  return genreMap;
}

function mapTmdbMovie(movie, genreMap, categoryLabel) {
  if (!movie || !movie.title) {
    return null;
  }

  const genres = Array.isArray(movie.genre_ids)
    ? movie.genre_ids
        .map((id) => genreMap.get(id))
        .filter(Boolean)
    : [];

  const releaseDate = typeof movie.release_date === "string" ? movie.release_date : "";
  const year = releaseDate ? Number(releaseDate.slice(0, 4)) : 0;
  const posterUrl = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : FALLBACK_POSTER;

  return {
    id: `tmdb-${movie.id}`,
    title: movie.title,
    year,
    runtime: 0,
    genres,
    director: "Unknown",
    actors: [],
    plot: movie.overview || "No plot available.",
    posterUrl,
    voteAverage: parseNumeric(movie.vote_average),
    popularity: parseNumeric(movie.popularity),
    source: categoryLabel
  };
}

function normalizeMovies(sourceMovies) {
  return sourceMovies
    .map((movie, index) => {
      const title = typeof movie.title === "string" ? movie.title.trim() : "";
      const year = parseNumeric(movie.year);
      const runtime = parseRuntime(movie.runtime);
      const voteAverage = parseNumeric(
        movie.voteAverage !== undefined && movie.voteAverage !== null ? movie.voteAverage : movie.vote_average
      );
      const popularity = parseNumeric(movie.popularity);
      const genres = Array.isArray(movie.genres)
        ? movie.genres.map((genre) => String(genre).trim()).filter(Boolean)
        : [];

      const actors = Array.isArray(movie.actors)
        ? movie.actors.map((actor) => String(actor).trim()).filter(Boolean)
        : typeof movie.actors === "string"
          ? movie.actors
              .split(",")
              .map((actor) => actor.trim())
              .filter(Boolean)
          : [];

      const id = movie.id ? String(movie.id) : `${slugify(title)}-${year || "na"}-${index}`;

      if (!title) {
        return null;
      }

      return {
        id,
        title,
        year,
        runtime,
        genres,
        director: typeof movie.director === "string" ? movie.director.trim() : "Unknown",
        actors,
        plot: typeof movie.plot === "string" ? movie.plot.trim() : "No plot available.",
        posterUrl: typeof movie.posterUrl === "string" && movie.posterUrl ? movie.posterUrl : FALLBACK_POSTER,
        voteAverage,
        popularity,
        source: movie.source ? String(movie.source) : ""
      };
    })
    .filter(Boolean);
}

function collectGenres(movies) {
  const genreSet = new Set();
  movies.forEach((movie) => {
    movie.genres.forEach((genre) => {
      genreSet.add(genre);
    });
  });
  return Array.from(genreSet).sort((a, b) => a.localeCompare(b));
}

function renderGenreOptions(genres) {
  genreOptions.innerHTML = "";

  genres.forEach((genre) => {
    const row = document.createElement("label");
    row.className = "genre-option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = state.selectedGenres.has(genre);
    input.addEventListener("change", () => {
      if (input.checked) {
        state.selectedGenres.add(genre);
      } else {
        state.selectedGenres.delete(genre);
      }
      renderSelectedGenres();
      runFilterPipeline();
    });

    const text = document.createElement("span");
    text.textContent = genre;

    row.appendChild(input);
    row.appendChild(text);
    genreOptions.appendChild(row);
  });
}

function renderSelectedGenres() {
  selectedGenresView.innerHTML = "";

  if (state.selectedGenres.size === 0) {
    const chip = document.createElement("span");
    chip.className = "selected-genre";
    chip.textContent = "All genres";
    selectedGenresView.appendChild(chip);
    return;
  }

  Array.from(state.selectedGenres)
    .sort((a, b) => a.localeCompare(b))
    .forEach((genre) => {
      const chip = document.createElement("span");
      chip.className = "selected-genre";
      chip.textContent = genre;
      selectedGenresView.appendChild(chip);
    });
}

function switchMode(mode) {
  state.mode = mode;
  updateModeButtons();
  updateHeroStats();
  runFilterPipeline();
}

function updateModeButtons() {
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });
}

function handleApplyFilters(event) {
  event.preventDefault();
  runFilterPipeline();
}

function handleReset() {
  form.reset();
  state.selectedGenres.clear();
  state.mode = "discover";
  updateModeButtons();
  updateHeroStats();
  minMatchValue.textContent = String(Number(minMatchInput.value));
  if (personalizeStrengthInput && personalizeValue) {
    personalizeValue.textContent = String(Number(personalizeStrengthInput.value));
  }
  renderSelectedGenres();

  const checkboxes = genreOptions.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  runFilterPipeline();
}

function handleSurprise() {
  if (state.allMovies.length === 0) {
    return;
  }

  const randomMovie = state.allMovies[Math.floor(Math.random() * state.allMovies.length)];
  if (!randomMovie) {
    return;
  }

  const similar = getSimilarMovies(randomMovie, 45);
  const list = [randomMovie, ...similar.filter((movie) => movie.id !== randomMovie.id)].slice(0, 36);
  const scored = list.map((movie) => ({
    ...movie,
    score: movie.id === randomMovie.id ? 99 : computeSimilarityScore(randomMovie, movie),
    reason: movie.id === randomMovie.id ? "Surprise pick" : `Similar to ${randomMovie.title}`
  }));

  state.filteredMovies = scored;
  state.lastFilters = {
    mode: "surprise",
    query: randomMovie.title,
    selectedGenres: randomMovie.genres,
    minMatch: 0,
    genreMatch: "any",
    director: "",
    actor: "",
    yearFrom: null,
    yearTo: null,
    runtimeMin: null,
    runtimeMax: null,
    sortBy: "recommendation"
  };

  resetAndRenderPages();
  renderActiveChips(state.lastFilters, `Surprise inspired by ${randomMovie.title}`);
}

function runFilterPipeline() {
  if (state.allMovies.length === 0) {
    return;
  }

  const filters = readFilters();
  const serial = ++state.requestSerial;

  setLoading(true);

  window.requestAnimationFrame(() => {
    if (serial !== state.requestSerial) {
      return;
    }

    const tasteProfile = updateTasteProfile();

    const filtered = applyFilters(state.allMovies, filters, tasteProfile);
    state.filteredMovies = sortMovies(filtered, filters.sortBy);
    state.lastFilters = filters;

    resetAndRenderPages();
    renderActiveChips(filters, modeLabel(state.mode));
    setLoading(false);
  });
}

function readFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedGenres = Array.from(state.selectedGenres);
  const genreMatch = genreMatchSelect.value;
  const director = directorFilterInput.value.trim().toLowerCase();
  const actor = actorFilterInput.value.trim().toLowerCase();
  const personalizeStrength = personalizeStrengthInput
    ? Number(personalizeStrengthInput.value || 0)
    : 0;
  const hideSeen = Boolean(hideSeenInput && hideSeenInput.checked);

  let yearFrom = toNumberOrNull(yearFromInput.value);
  let yearTo = toNumberOrNull(yearToInput.value);
  let runtimeMin = toNumberOrNull(runtimeMinInput.value);
  let runtimeMax = toNumberOrNull(runtimeMaxInput.value);

  if (yearFrom && yearTo && yearFrom > yearTo) {
    const temp = yearFrom;
    yearFrom = yearTo;
    yearTo = temp;
  }

  if (runtimeMin && runtimeMax && runtimeMin > runtimeMax) {
    const temp = runtimeMin;
    runtimeMin = runtimeMax;
    runtimeMax = temp;
  }

  return {
    mode: state.mode,
    query,
    selectedGenres,
    genreMatch,
    director,
    actor,
    minMatch: Number(minMatchInput.value),
    personalizeStrength,
    hideSeen,
    yearFrom,
    yearTo,
    runtimeMin,
    runtimeMax,
    sortBy: sortSelect.value
  };
}

function applyFilters(movies, filters, tasteProfile) {
  return movies
    .map((movie) => {
      const baseScore = computeRecommendationScore(movie, filters);
      const personalScore = computePersonalScore(movie, tasteProfile);
      const trendScore = computeLocalTrendScore(movie.id);
      const score = blendScores(baseScore, personalScore, trendScore, filters, tasteProfile);
      const reason = buildRecommendationReason(movie, tasteProfile, personalScore, trendScore, filters);

      return {
        ...movie,
        score,
        baseScore,
        personalScore,
        trendScore,
        reason
      };
    })
    .filter((movie) => {
      if (!passesMode(movie, filters.mode, tasteProfile)) {
        return false;
      }

      if (filters.hideSeen && (favorites[movie.id] || userRatings[movie.id])) {
        return false;
      }

      if (filters.selectedGenres.length > 0) {
        const matchCount = filters.selectedGenres.filter((genre) => movie.genres.includes(genre)).length;
        if (filters.genreMatch === "all" && matchCount !== filters.selectedGenres.length) {
          return false;
        }
        if (filters.genreMatch === "any" && matchCount === 0) {
          return false;
        }
      }

      if (filters.query) {
        const haystack = [movie.title, movie.plot, movie.director, movie.actors.join(" "), movie.genres.join(" ")]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(filters.query)) {
          return false;
        }
      }

      if (filters.director && !movie.director.toLowerCase().includes(filters.director)) {
        return false;
      }

      if (filters.actor) {
        const actorHit = movie.actors.some((name) => name.toLowerCase().includes(filters.actor));
        if (!actorHit) {
          return false;
        }
      }

      if (filters.yearFrom && (!movie.year || movie.year < filters.yearFrom)) {
        return false;
      }

      if (filters.yearTo && (!movie.year || movie.year > filters.yearTo)) {
        return false;
      }

      if (filters.runtimeMin && (!movie.runtime || movie.runtime < filters.runtimeMin)) {
        return false;
      }

      if (filters.runtimeMax && (!movie.runtime || movie.runtime > filters.runtimeMax)) {
        return false;
      }

      if (filters.mode === "for-you" && tasteProfile?.hasData) {
        if (movie.personalScore < 22 && movie.trendScore < 18 && movie.score < 40) {
          return false;
        }
      }

      if (movie.score < filters.minMatch) {
        return false;
      }

      return true;
    });
}

function passesMode(movie, mode) {
  if (mode === "for-you") {
    return true;
  }

  if (mode === "newest") {
    return movie.year >= 2010;
  }

  if (mode === "classics") {
    return movie.year > 0 && movie.year <= 1999;
  }

  if (mode === "long-watch") {
    return movie.runtime >= 140;
  }

  return true;
}

function computeRecommendationScore(movie, filters) {
  let score = 26;

  if (movie.year) {
    score += clamp((movie.year - 1950) / 3, 0, 18);
  }

  if (movie.runtime) {
    score += clamp((movie.runtime - 70) / 6, 0, 14);
  }

  if (movie.voteAverage) {
    score += clamp(movie.voteAverage * 1.8, 0, 18);
  }

  if (movie.popularity) {
    score += clamp(Math.log(movie.popularity + 1) * 3, 0, 14);
  }

  if (filters.selectedGenres.length > 0) {
    const hitCount = filters.selectedGenres.filter((genre) => movie.genres.includes(genre)).length;
    score += hitCount * 12;
    if (filters.genreMatch === "all" && hitCount === filters.selectedGenres.length) {
      score += 8;
    }
  }

  if (filters.query) {
    const title = movie.title.toLowerCase();
    const plot = movie.plot.toLowerCase();

    if (title.includes(filters.query)) {
      score += 24;
    } else if (plot.includes(filters.query)) {
      score += 12;
    }
  }

  if (filters.director && movie.director.toLowerCase().includes(filters.director)) {
    score += 18;
  }

  if (filters.actor) {
    const actorHit = movie.actors.some((name) => name.toLowerCase().includes(filters.actor));
    if (actorHit) {
      score += 18;
    }
  }

  if (filters.mode === "newest" && movie.year >= 2018) {
    score += 10;
  }

  if (filters.mode === "classics" && movie.year > 0 && movie.year <= 1999) {
    score += 10;
  }

  if (filters.mode === "long-watch" && movie.runtime >= 150) {
    score += 10;
  }

  return clamp(Math.round(score), 0, 99);
}

function buildTasteProfile() {
  const profile = {
    genres: new Map(),
    directors: new Map(),
    actors: new Map(),
    anchors: [],
    yearSum: 0,
    runtimeSum: 0,
    yearWeight: 0,
    runtimeWeight: 0,
    yearMin: null,
    yearMax: null,
    runtimeMin: null,
    runtimeMax: null,
    hasData: false,
    totalSignals: 0,
    topGenres: [],
    topDirectors: [],
    topActors: [],
    maxGenreWeight: 0,
    maxDirectorWeight: 0,
    maxActorWeight: 0,
    yearMean: null,
    runtimeMean: null,
    yearRange: null,
    runtimeRange: null
  };

  const anchorMap = new Map();

  const addMovie = (movie, weight) => {
    if (!movie) {
      return;
    }

    movie.genres.forEach((genre) => bumpPreference(profile.genres, genre, weight));
    if (movie.director && movie.director !== "Unknown") {
      bumpPreference(profile.directors, movie.director, weight);
    }
    movie.actors.forEach((actor) => bumpPreference(profile.actors, actor, weight));

    if (movie.year) {
      profile.yearSum += movie.year * weight;
      profile.yearWeight += weight;
      profile.yearMin = profile.yearMin === null ? movie.year : Math.min(profile.yearMin, movie.year);
      profile.yearMax = profile.yearMax === null ? movie.year : Math.max(profile.yearMax, movie.year);
    }

    if (movie.runtime) {
      profile.runtimeSum += movie.runtime * weight;
      profile.runtimeWeight += weight;
      profile.runtimeMin = profile.runtimeMin === null ? movie.runtime : Math.min(profile.runtimeMin, movie.runtime);
      profile.runtimeMax = profile.runtimeMax === null ? movie.runtime : Math.max(profile.runtimeMax, movie.runtime);
    }
  };

  Object.values(favorites).forEach((favorite) => {
    const movie = state.movieIndex.get(favorite.id);
    if (!movie) {
      return;
    }
    const weight = 1.4;
    addMovie(movie, weight);
    anchorMap.set(movie.id, Math.max(anchorMap.get(movie.id) || 0, weight));
    profile.totalSignals += 1;
  });

  Object.entries(userRatings).forEach(([movieId, ratingValue]) => {
    const movie = state.movieIndex.get(movieId);
    if (!movie) {
      return;
    }
    const rating = Number(ratingValue);
    const weight = clamp(rating / 5, 0.2, 1.2);
    addMovie(movie, weight);
    anchorMap.set(movie.id, Math.max(anchorMap.get(movie.id) || 0, weight));
    profile.totalSignals += 1;
  });

  profile.anchors = Array.from(anchorMap.entries())
    .map(([movieId, weight]) => ({
      movie: state.movieIndex.get(movieId),
      weight
    }))
    .filter((entry) => entry.movie)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  profile.hasData = profile.totalSignals > 0;
  profile.maxGenreWeight = getMaxWeight(profile.genres);
  profile.maxDirectorWeight = getMaxWeight(profile.directors);
  profile.maxActorWeight = getMaxWeight(profile.actors);
  profile.yearMean = profile.yearWeight ? profile.yearSum / profile.yearWeight : null;
  profile.runtimeMean = profile.runtimeWeight ? profile.runtimeSum / profile.runtimeWeight : null;
  profile.yearRange =
    profile.yearMin !== null && profile.yearMax !== null ? Math.max(8, profile.yearMax - profile.yearMin) : null;
  profile.runtimeRange =
    profile.runtimeMin !== null && profile.runtimeMax !== null
      ? Math.max(30, profile.runtimeMax - profile.runtimeMin)
      : null;

  profile.topGenres = getTopEntries(profile.genres, 4).map((entry) => entry.key);
  profile.topDirectors = getTopEntries(profile.directors, 3).map((entry) => entry.key);
  profile.topActors = getTopEntries(profile.actors, 3).map((entry) => entry.key);

  return profile;
}

function updateTasteProfile() {
  const profile = buildTasteProfile();
  state.tasteProfile = profile;
  renderTasteProfile(profile);
  return profile;
}

function renderTasteProfile(profile) {
  if (!tasteStrength || !tasteSummary || !tasteTags) {
    return;
  }

  tasteTags.innerHTML = "";

  if (!profile.hasData) {
    tasteStrength.textContent = "Just starting";
    tasteSummary.textContent = "Rate and favorite movies to personalize your feed.";
    const starter = document.createElement("span");
    starter.className = "taste-tag";
    starter.textContent = "Add 5 ratings to unlock For You";
    tasteTags.appendChild(starter);
    return;
  }

  const signalCount = profile.totalSignals;
  const strengthLabel =
    signalCount < 3 ? "Just starting" : signalCount < 7 ? "Building taste" : signalCount < 12 ? "Tuned in" : "Dialed in";
  tasteStrength.textContent = strengthLabel;

  const summaryParts = [];
  if (profile.topGenres.length) {
    summaryParts.push(`Top genres: ${profile.topGenres.slice(0, 3).join(", ")}`);
  }
  if (profile.topDirectors.length) {
    summaryParts.push(`Directors: ${profile.topDirectors.slice(0, 2).join(", ")}`);
  }
  if (profile.topActors.length) {
    summaryParts.push(`Actors: ${profile.topActors.slice(0, 2).join(", ")}`);
  }
  tasteSummary.textContent = summaryParts.length ? summaryParts.join(" | ") : "Your taste is taking shape.";

  const tagList = [
    ...profile.topGenres.slice(0, 2),
    ...profile.topDirectors.slice(0, 1),
    ...profile.topActors.slice(0, 1)
  ];

  if (profile.yearMean) {
    tagList.push(`Era ~${Math.round(profile.yearMean)}`);
  }

  tagList.slice(0, 5).forEach((tag) => {
    const chip = document.createElement("span");
    chip.className = "taste-tag";
    chip.textContent = tag;
    tasteTags.appendChild(chip);
  });
}

function bumpPreference(map, key, weight) {
  if (!key) {
    return;
  }
  const next = (map.get(key) || 0) + weight;
  map.set(key, next);
}

function getMaxWeight(map) {
  let max = 0;
  map.forEach((value) => {
    if (value > max) {
      max = value;
    }
  });
  return max;
}

function getTopEntries(map, limit) {
  return Array.from(map.entries())
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function computePersonalScore(movie, profile) {
  if (!profile?.hasData) {
    return 0;
  }

  const components = [];

  if (profile.maxGenreWeight > 0 && movie.genres.length) {
    const weights = movie.genres
      .map((genre) => profile.genres.get(genre) || 0)
      .sort((a, b) => b - a)
      .slice(0, 3);
    const maxPossible = profile.maxGenreWeight * Math.min(3, movie.genres.length);
    const affinity = maxPossible ? weights.reduce((sum, value) => sum + value, 0) / maxPossible : 0;
    components.push({ value: affinity, weight: 0.38 });
  }

  if (profile.maxDirectorWeight > 0 && movie.director) {
    const affinity = (profile.directors.get(movie.director) || 0) / profile.maxDirectorWeight;
    components.push({ value: affinity, weight: 0.18 });
  }

  if (profile.maxActorWeight > 0 && movie.actors.length) {
    const weights = movie.actors
      .map((actor) => profile.actors.get(actor) || 0)
      .sort((a, b) => b - a)
      .slice(0, 3);
    const maxPossible = profile.maxActorWeight * Math.min(3, movie.actors.length);
    const affinity = maxPossible ? weights.reduce((sum, value) => sum + value, 0) / maxPossible : 0;
    components.push({ value: affinity, weight: 0.18 });
  }

  if (profile.yearMean && movie.year) {
    const range = profile.yearRange || 25;
    const affinity = clamp(1 - Math.abs(movie.year - profile.yearMean) / range, 0, 1);
    components.push({ value: affinity, weight: 0.13 });
  }

  if (profile.runtimeMean && movie.runtime) {
    const range = profile.runtimeRange || 90;
    const affinity = clamp(1 - Math.abs(movie.runtime - profile.runtimeMean) / range, 0, 1);
    components.push({ value: affinity, weight: 0.13 });
  }

  const totalWeight = components.reduce((sum, component) => sum + component.weight, 0);
  if (!totalWeight) {
    return 0;
  }

  const score =
    components.reduce((sum, component) => sum + component.value * component.weight, 0) / totalWeight;
  return clamp(Math.round(score * 100), 0, 99);
}

function computeLocalTrendScore(movieId) {
  const signal = signals[movieId];
  if (!signal) {
    return 0;
  }

  const base =
    (signal.trailer || 0) * 6 +
    (signal.similar || 0) * 4 +
    (signal.favorite || 0) * 12 +
    (signal.rating || 0) * 10;

  const lastSeen = Number(signal.lastSeen || 0);
  const ageHours = lastSeen ? (Date.now() - lastSeen) / (1000 * 60 * 60) : 999;
  const freshness = clamp(18 - ageHours / 6, 0, 18);

  return clamp(Math.round(base + freshness), 0, 100);
}

function blendScores(baseScore, personalScore, trendScore, filters, profile) {
  const personalization = clamp(Number(filters.personalizeStrength || 0) / 100, 0, 1);
  const hasTaste = Boolean(profile?.hasData);
  const personalBlend = hasTaste ? personalization : 0;
  const trendBlend = hasTaste ? Math.min(0.15, personalization * 0.2) : 0.05;
  const baseBlend = Math.max(0, 1 - personalBlend - trendBlend);
  const totalWeight = personalBlend + trendBlend + baseBlend || 1;
  const blended =
    (baseScore * baseBlend + personalScore * personalBlend + trendScore * trendBlend) / totalWeight;
  const forYouBoost = filters.mode === "for-you" ? 1.08 : 1;
  return clamp(Math.round(blended * forYouBoost), 0, 99);
}

function buildRecommendationReason(movie, profile, personalScore, trendScore, filters) {
  if (movie.reason) {
    return movie.reason;
  }

  if (profile?.hasData) {
    const anchor = pickBestAnchor(movie, profile.anchors);
    if (anchor && anchor.similarity >= 55) {
      return `Because you liked ${anchor.movie.title}`;
    }

    const topGenre = profile.topGenres.find((genre) => movie.genres.includes(genre));
    if (topGenre) {
      return `Matches your ${topGenre} taste`;
    }

    if (movie.director && profile.directors.has(movie.director)) {
      return `Directed by ${movie.director}`;
    }

    const likedActor = movie.actors.find((actor) => profile.actors.has(actor));
    if (likedActor) {
      return `Starring ${likedActor}`;
    }

    if (personalScore >= 70) {
      return "High personal match";
    }
  }

  if (movie.voteAverage >= 7.8 && movie.popularity >= 60) {
    return "Top rated hit";
  }

  if (movie.popularity >= 80) {
    return "Popular right now";
  }

  if (movie.voteAverage >= 7.5) {
    return "Critically liked";
  }

  if (trendScore >= 45) {
    return "Trending in your sessions";
  }

  if (filters.mode === "newest" && movie.year >= 2018) {
    return "Fresh release";
  }

  return "";
}

function pickBestAnchor(movie, anchors) {
  if (!anchors?.length) {
    return null;
  }

  let best = null;
  anchors.forEach((entry) => {
    if (!entry.movie || entry.movie.id === movie.id) {
      return;
    }
    const similarity = computeSimilarityScore(entry.movie, movie);
    if (!best || similarity > best.similarity) {
      best = { movie: entry.movie, similarity };
    }
  });

  return best;
}

function sortMovies(movies, sortBy) {
  const sorted = movies.slice();

  if (sortBy === "year_desc") {
    sorted.sort((a, b) => b.year - a.year || b.score - a.score);
    return sorted;
  }

  if (sortBy === "year_asc") {
    sorted.sort((a, b) => a.year - b.year || b.score - a.score);
    return sorted;
  }

  if (sortBy === "runtime_desc") {
    sorted.sort((a, b) => b.runtime - a.runtime || b.score - a.score);
    return sorted;
  }

  if (sortBy === "runtime_asc") {
    sorted.sort((a, b) => a.runtime - b.runtime || b.score - a.score);
    return sorted;
  }

  if (sortBy === "title_asc") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }

  sorted.sort((a, b) => b.score - a.score || b.year - a.year);
  return sorted;
}

function resetAndRenderPages() {
  state.currentPage = 0;
  state.totalPages = Math.max(1, Math.ceil(state.filteredMovies.length / PAGE_SIZE));
  resultsContainer.innerHTML = "";

  appendNextPage();
  updateResultCount();
  updateInfiniteState();
  updateHeroStats();
}

function appendNextPage() {
  if (state.currentPage >= state.totalPages) {
    return;
  }

  const nextPage = state.currentPage + 1;
  const start = (nextPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const slice = state.filteredMovies.slice(start, end);

  if (nextPage === 1 && slice.length === 0) {
    showEmptyState("No movies matched your filters. Try broadening criteria.");
  } else {
    hideEmptyState();
  }

  renderResults(slice, nextPage !== 1);

  state.currentPage = nextPage;
  updateResultCount();
  updateInfiniteState();
  updateHeroStats();
}

function renderResults(movies, append) {
  if (!append) {
    resultsContainer.innerHTML = "";
  }

  movies.forEach((movie, index) => {
    const card = movieCardTemplate.content.firstElementChild.cloneNode(true);
    card.dataset.movieId = movie.id;
    card.style.animationDelay = `${index * 32}ms`;

    const poster = card.querySelector(".poster");
    poster.src = movie.posterUrl || FALLBACK_POSTER;
    poster.alt = `${movie.title} poster`;

    card.querySelector(".movie-year").textContent = movie.year || "N/A";
    card.querySelector(".runtime-pill").textContent = movie.runtime ? `${movie.runtime}m` : "--";
    card.querySelector(".movie-title").textContent = movie.title;

    const actorPreview = movie.actors.slice(0, 2).join(", ");
    const metaParts = [];
    if (movie.director && movie.director !== "Unknown") {
      metaParts.push(movie.director);
    }
    if (actorPreview) {
      metaParts.push(actorPreview);
    }
    if (!metaParts.length && movie.voteAverage) {
      metaParts.push(`TMDB ${movie.voteAverage.toFixed(1)}`);
    }
    card.querySelector(".movie-meta").textContent = metaParts.join(" | ");

    const reasonTag = card.querySelector(".recommendation-reason");
    if (reasonTag) {
      if (movie.reason) {
        reasonTag.textContent = movie.reason;
        reasonTag.hidden = false;
      } else {
        reasonTag.hidden = true;
      }
    }
    card.querySelector(".movie-description").textContent = movie.plot;

    const genreRow = card.querySelector(".genre-row");
    genreRow.innerHTML = "";
    (movie.genres.length ? movie.genres : ["Unknown"]).slice(0, 4).forEach((genre) => {
      const pill = document.createElement("span");
      pill.className = "genre-pill";
      pill.textContent = genre;
      genreRow.appendChild(pill);
    });

    card.querySelector(".score-pill").textContent = `${getScoreLabel()} ${movie.score}%`;

    const ratingContainer = card.querySelector(".user-rating");
    renderUserRating(ratingContainer, movie.id);

    const trailerButton = card.querySelector(".btn-trailer");
    trailerButton.addEventListener("click", () => openTrailer(movie));

    const similarButton = card.querySelector(".btn-similar");
    similarButton.addEventListener("click", () => showSimilarFeed(movie));

    const saveButton = card.querySelector(".btn-save");
    updateSaveButtonState(saveButton, movie.id);
    saveButton.addEventListener("click", () => {
      toggleFavorite(movie);
      syncFavoriteButtons();
    });

    resultsContainer.appendChild(card);
  });
}

function showSimilarFeed(anchor) {
  trackSignal(anchor.id, "similar");
  const similar = getSimilarMovies(anchor, 24);
  const feed = [anchor, ...similar].map((movie) => ({
    ...movie,
    score: movie.id === anchor.id ? 99 : computeSimilarityScore(anchor, movie),
    reason: movie.id === anchor.id ? `Selected: ${anchor.title}` : `Similar to ${anchor.title}`
  }));

  state.filteredMovies = feed;
  state.currentPage = 0;
  state.totalPages = Math.max(1, Math.ceil(feed.length / PAGE_SIZE));
  state.lastFilters = { mode: "similar" };

  resultsContainer.innerHTML = "";
  appendNextPage();
  renderActiveChips(readFilters(), `Similar to ${anchor.title}`);
  updateHeroStats();
}

function getSimilarMovies(anchor, limit) {
  return state.allMovies
    .filter((movie) => movie.id !== anchor.id)
    .map((movie) => ({
      movie,
      score: computeSimilarityScore(anchor, movie)
    }))
    .filter((entry) => entry.score >= 28)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => ({
      ...entry.movie,
      score: entry.score
    }));
}

function computeSimilarityScore(a, b) {
  let score = 0;

  const sharedGenres = a.genres.filter((genre) => b.genres.includes(genre)).length;
  score += sharedGenres * 18;

  if (a.director && b.director && a.director === b.director) {
    score += 16;
  }

  const sharedActors = a.actors.filter((actor) => b.actors.includes(actor)).length;
  score += sharedActors * 12;

  if (a.year && b.year) {
    const yearGap = Math.abs(a.year - b.year);
    score += clamp(16 - yearGap, 0, 16);
  }

  if (a.runtime && b.runtime) {
    const runtimeGap = Math.abs(a.runtime - b.runtime);
    score += clamp(10 - runtimeGap / 10, 0, 10);
  }

  return clamp(Math.round(score), 0, 99);
}

function renderActiveChips(filters, label) {
  activeQuery.innerHTML = "";

  const chips = [label];

  if (filters.query) {
    chips.push(`Query: ${filters.query}`);
  }

  if (filters.selectedGenres.length > 0) {
    chips.push(`Genres (${filters.genreMatch}): ${filters.selectedGenres.join(", ")}`);
  }

  if (filters.director) {
    chips.push(`Director: ${filters.director}`);
  }

  if (filters.actor) {
    chips.push(`Actor: ${filters.actor}`);
  }

  chips.push(`Min match: ${filters.minMatch}%`);

  if (filters.personalizeStrength > 0) {
    chips.push(`Personalization: ${filters.personalizeStrength}%`);
  }

  if (filters.hideSeen) {
    chips.push("Hiding rated/saved titles");
  }

  if (filters.yearFrom || filters.yearTo) {
    chips.push(`Years: ${filters.yearFrom || "*"}-${filters.yearTo || "*"}`);
  }

  if (filters.runtimeMin || filters.runtimeMax) {
    chips.push(`Runtime: ${filters.runtimeMin || 0}-${filters.runtimeMax || "*"}m`);
  }

  chips.forEach((text) => {
    const chip = document.createElement("span");
    chip.className = "query-chip";
    chip.textContent = text;
    activeQuery.appendChild(chip);
  });
}

function modeLabel(mode) {
  if (mode === "surprise") {
    return "Surprise mode";
  }

  if (mode === "similar") {
    return "Similar feed";
  }

  if (mode === "newest") {
    return "Newest releases mode";
  }
  if (mode === "for-you") {
    return "For You mode";
  }
  if (mode === "classics") {
    return "Classics mode";
  }
  if (mode === "long-watch") {
    return "Long watch mode";
  }
  return "Discovery mode";
}

function updateResultCount() {
  resultCount.textContent = `${state.filteredMovies.length} movies | Page ${state.currentPage}/${state.totalPages}`;
}

function getScoreLabel() {
  const activeMode = state.lastFilters?.mode || state.mode;
  if (activeMode === "for-you") {
    return "For you";
  }
  if (activeMode === "similar") {
    return "Similar";
  }
  if (activeMode === "surprise") {
    return "Surprise";
  }
  return "Match";
}

function updateHeroStats() {
  if (heroCatalogCount) {
    heroCatalogCount.textContent = String(state.allMovies.length);
  }

  if (heroVisibleCount) {
    heroVisibleCount.textContent = String(state.filteredMovies.length);
  }

  if (heroFavoritesCount) {
    heroFavoritesCount.textContent = String(Object.keys(favorites).length);
  }

  if (heroModeLabel) {
    const activeMode = state.lastFilters?.mode || state.mode;
    heroModeLabel.textContent = `Current feed: ${modeLabel(activeMode)}`;
  }
}

function setLoading(loading) {
  state.isLoading = loading;
  loadingState.hidden = !loading;
}

function registerServiceWorker() {
  if (!CONFIG.enablePwa) {
    return;
  }

  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      return;
    });
  });
}

function setupInfiniteScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (!entry.isIntersecting) {
        return;
      }

      if (state.isLoading) {
        return;
      }

      appendNextPage();
    },
    {
      rootMargin: "340px 0px"
    }
  );

  observer.observe(scrollSentinel);
}

function updateInfiniteState() {
  scrollSentinel.hidden = state.currentPage >= state.totalPages;
}

function openTrailer(movie) {
  trackSignal(movie.id, "trailer");
  const query = `${movie.title} ${movie.year || ""} official trailer`;
  trailerTitle.textContent = `${movie.title} Trailer`;
  trailerMessage.textContent = "Powered by YouTube search.";
  trailerFrame.src = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}`;
  trailerModal.hidden = false;
}

function closeTrailerModal() {
  trailerModal.hidden = true;
  trailerFrame.src = "";
}

function toggleFavorite(movie) {
  if (favorites[movie.id]) {
    delete favorites[movie.id];
  } else {
    favorites[movie.id] = {
      id: movie.id,
      title: movie.title,
      year: movie.year,
      genre: movie.genres[0] || "Unknown",
      score: movie.score
    };
    trackSignal(movie.id, "favorite");
  }

  persistFavoritesMap();
  renderFavorites();
  refreshIfPersonalized();
}

function renderFavorites() {
  favoritesContainer.innerHTML = "";

  const list = Object.values(favorites);
  if (list.length === 0) {
    favoritesEmpty.hidden = false;
    updateHeroStats();
    updateTasteProfile();
    return;
  }

  favoritesEmpty.hidden = true;

  list
    .slice()
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
    .forEach((movie) => {
      const row = document.createElement("article");
      row.className = "favorite-item";

      const personal = Number(userRatings[movie.id] || 0);
      const personalLabel = personal > 0 ? ` | You: ${"★".repeat(personal)}` : "";

      const info = document.createElement("div");
      info.innerHTML = `<div class="favorite-name">${escapeHtml(movie.title)}</div><div class="favorite-sub">${movie.year || "N/A"} | ${escapeHtml(movie.genre)}${personalLabel}</div>`;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "favorite-remove";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        delete favorites[movie.id];
        persistFavoritesMap();
        renderFavorites();
        syncFavoriteButtons();
      });

      row.appendChild(info);
      row.appendChild(remove);
      favoritesContainer.appendChild(row);
    });

  updateHeroStats();
  updateTasteProfile();
}

function refreshIfPersonalized() {
  if (state.lastFilters?.mode === "similar" || state.lastFilters?.mode === "surprise") {
    return;
  }

  if (state.mode === "for-you" || state.lastFilters?.mode === "for-you") {
    runFilterPipeline();
  }
}

function clearFavorites() {
  Object.keys(favorites).forEach((id) => {
    delete favorites[id];
  });

  persistFavoritesMap();
  renderFavorites();
  syncFavoriteButtons();
  refreshIfPersonalized();
}

function updateSaveButtonState(button, movieId) {
  const saved = Boolean(favorites[movieId]);
  button.classList.toggle("saved", saved);
  button.textContent = saved ? "Saved ❤" : "Favorite ❤";
  button.setAttribute("aria-pressed", String(saved));
}

function syncFavoriteButtons() {
  const cards = resultsContainer.querySelectorAll(".movie-card");
  cards.forEach((card) => {
    const movieId = card.dataset.movieId;
    if (!movieId) {
      return;
    }

    const saveButton = card.querySelector(".btn-save");
    if (saveButton) {
      updateSaveButtonState(saveButton, movieId);
    }
  });
}

function renderUserRating(container, movieId) {
  container.innerHTML = "";

  const current = Number(userRatings[movieId] || 0);

  for (let star = 1; star <= 5; star += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "star-btn";
    if (star <= current) {
      button.classList.add("active");
    }

    button.textContent = star <= current ? "★" : "☆";
    button.setAttribute("aria-label", `Rate ${star} star${star > 1 ? "s" : ""}`);

    button.addEventListener("click", () => {
      const nextValue = current === star ? 0 : star;
      setUserRating(movieId, nextValue);
      syncRatingWidgets(movieId);
      renderFavorites();
      refreshIfPersonalized();
    });

    container.appendChild(button);
  }
}

function setUserRating(movieId, value) {
  if (value <= 0) {
    delete userRatings[movieId];
  } else {
    userRatings[movieId] = value;
    trackSignal(movieId, "rating");
  }

  persistRatingsMap();
}

function syncRatingWidgets(movieId) {
  const containers = resultsContainer.querySelectorAll(`.movie-card[data-movie-id="${movieId}"] .user-rating`);
  containers.forEach((container) => {
    renderUserRating(container, movieId);
  });
}

function showDataStatus(message, type) {
  dataStatus.textContent = message;
  dataStatus.classList.remove("success", "error");

  if (type === "success") {
    dataStatus.classList.add("success");
  }

  if (type === "error") {
    dataStatus.classList.add("error");
  }
}

function showEmptyState(message) {
  emptyState.textContent = message;
  emptyState.hidden = false;
}

function hideEmptyState() {
  emptyState.hidden = true;
}

function parseNumeric(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseRuntime(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const match = value.match(/\d+/);
    if (match) {
      return Number(match[0]);
    }
  }

  return 0;
}

function toNumberOrNull(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function slugify(value) {
  return String(value || "movie")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function loadFavoritesMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.favorites);
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    return {};
  }
  return {};
}

function persistFavoritesMap() {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
}

function loadRatingsMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ratings);
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    return {};
  }
  return {};
}

function persistRatingsMap() {
  localStorage.setItem(STORAGE_KEYS.ratings, JSON.stringify(userRatings));
}

function loadSignalsMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.signals);
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    return {};
  }
  return {};
}

function persistSignalsMap() {
  localStorage.setItem(STORAGE_KEYS.signals, JSON.stringify(signals));
}

function trackSignal(movieId, type) {
  if (!movieId) {
    return;
  }

  if (!signals[movieId]) {
    signals[movieId] = {
      trailer: 0,
      similar: 0,
      favorite: 0,
      rating: 0,
      lastSeen: 0
    };
  }

  const entry = signals[movieId];
  if (type === "trailer") {
    entry.trailer += 1;
  }
  if (type === "similar") {
    entry.similar += 1;
  }
  if (type === "favorite") {
    entry.favorite += 1;
  }
  if (type === "rating") {
    entry.rating += 1;
  }

  entry.lastSeen = Date.now();
  persistSignalsMap();
}
