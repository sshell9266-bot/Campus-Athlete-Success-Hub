"use strict";

/*
    Campus Athlete Success Hub
    MVP JavaScript

    Features:
    - Current date and time
    - Motivational quotes API
    - Weather API
    - Basic workout tracking
    - Browser local storage
*/

// ========================================
// DASHBOARD: DATE AND TIME
// ========================================

function updateDateTime() {
    const dateElement = document.getElementById("currentDateTime");

    if (dateElement) {
        const now = new Date();

        dateElement.textContent = now.toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }
}

updateDateTime();

if (document.getElementById("currentDateTime")) {
    setInterval(updateDateTime, 60000);
}


// ========================================
// DASHBOARD: MOTIVATIONAL QUOTES API
// ========================================

async function fetchMotivationalQuote() {
    const quoteElement = document.getElementById("motivationalQuote");
    const authorElement = document.getElementById("quoteAuthor");

    if (!quoteElement || !authorElement) return;

    try {
        const response = await fetch(
            "https://dummyjson.com/quotes/random"
        );

        if (!response.ok) {
            throw new Error("Quote request failed.");
        }

        const data = await response.json();

        if (!data.quote || !data.author) {
            throw new Error("Invalid quote data.");
        }

        quoteElement.textContent = `"${data.quote}"`;
        authorElement.textContent = data.author;

    } catch (error) {
        console.error("Quote API error:", error);

        quoteElement.textContent =
            "Keep working toward your goals!";
        authorElement.textContent =
            "Campus Athlete Success Hub";
    }
}

if (document.getElementById("motivationalQuote")) {
    fetchMotivationalQuote();

    const refreshButton = document.getElementById("refreshQuote");

    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            fetchMotivationalQuote
        );
    }
}


// ========================================
// DASHBOARD: WEATHER API
// ========================================

async function fetchWeather() {
    const temperature = document.getElementById("weatherTemperature");
    const conditions = document.getElementById("weatherConditions");
    const location = document.getElementById("weatherLocation");

    if (!temperature || !conditions || !location) return;

    try {
        // Weather information for Newberry, South Carolina.
        const url =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=34.2746&longitude=-81.6187" +
            "&current=temperature_2m,weather_code" +
            "&temperature_unit=fahrenheit";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather request failed.");
        }

        const data = await response.json();

        if (
            !data.current ||
            typeof data.current.temperature_2m !== "number" ||
            typeof data.current.weather_code !== "number"
        ) {
            throw new Error("Invalid weather data.");
        }

        temperature.textContent =
            `Temperature: ${Math.round(data.current.temperature_2m)}°F`;

        conditions.textContent =
            `Weather Code: ${data.current.weather_code}`;

        location.textContent = "Location: Newberry, SC";

    } catch (error) {
        console.error("Weather API error:", error);

        temperature.textContent = "Weather unavailable";
        conditions.textContent = "Please try again later.";
        location.textContent = "Location: Newberry, SC";
    }
}

fetchWeather();


// ========================================
// WORKOUT TRACKER: LOCAL STORAGE
// ========================================

const WORKOUT_STORAGE_KEY = "campusAthleteWorkouts";

function getSavedWorkouts() {
    try {
        const workouts = JSON.parse(
            localStorage.getItem(WORKOUT_STORAGE_KEY) || "[]"
        );

        return Array.isArray(workouts) ? workouts : [];

    } catch (error) {
        console.error("Unable to load workouts:", error);
        return [];
    }
}

function saveWorkouts(workouts) {
    try {
        localStorage.setItem(
            WORKOUT_STORAGE_KEY,
            JSON.stringify(workouts)
        );

        return true;

    } catch (error) {
        console.error("Unable to save workouts:", error);
        return false;
    }
}


// ========================================
// WORKOUT TRACKER: FORM FIELDS
// ========================================

function updateWorkoutFields() {
    const typeElement = document.getElementById("workoutType");

    if (!typeElement) return;

    const type = typeElement.value;

    const fields = {
        setsField: "workoutSets",
        repsField: "workoutReps",
        weightField: "workoutWeight",
        durationField: "workoutDuration",
        distanceField: "workoutDistance",
        notesField: "workoutNotes"
    };

    // Hide all optional workout fields first.
    Object.entries(fields).forEach(function ([fieldId, inputId]) {
        const field = document.getElementById(fieldId);
        const input = document.getElementById(inputId);

        if (field && input) {
            field.hidden = true;
            input.disabled = true;
            input.required = false;
        }
    });

    let visibleFields = [];

    // Choose fields based on the workout type.
    if (type === "Strength") {
        visibleFields = ["setsField", "repsField", "weightField"];
    } else if (type === "Cardio") {
        visibleFields = ["durationField", "distanceField"];
    } else if (type) {
        visibleFields = ["durationField", "notesField"];
    }

    // Display the relevant fields.
    visibleFields.forEach(function (fieldId) {
        const field = document.getElementById(fieldId);
        const input = document.getElementById(fields[fieldId]);

        if (field && input) {
            field.hidden = false;
            input.disabled = false;
        }
    });

    // Make the appropriate fields required.
    if (type === "Strength") {
        document.getElementById("workoutSets").required = true;
        document.getElementById("workoutReps").required = true;
    } else if (type) {
        document.getElementById("workoutDuration").required = true;
    }
}

const workoutTypeSelect = document.getElementById("workoutType");

if (workoutTypeSelect) {
    workoutTypeSelect.addEventListener(
        "change",
        updateWorkoutFields
    );

    updateWorkoutFields();
}


// ========================================
// WORKOUT TRACKER: SAVE WORKOUTS
// ========================================

const workoutForm = document.getElementById("workoutForm");

if (workoutForm) {
    workoutForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const date = document.getElementById("workoutDate").value;
        const type = document.getElementById("workoutType").value;
        const exercise = document.getElementById("exerciseName").value;
        const message = document.getElementById("workoutMessage");

        if (!date || !type || !exercise.trim()) {
            message.textContent = "Please complete the required fields.";
            message.className = "text-danger mt-2";
            return;
        }

        const workout = {
            date: date,
            type: type,
            exercise: exercise.trim(),
            sets: document.getElementById("workoutSets").value,
            reps: document.getElementById("workoutReps").value,
            weight: document.getElementById("workoutWeight").value,
            duration: document.getElementById("workoutDuration").value,
            distance: document.getElementById("workoutDistance").value,
            notes: document.getElementById("workoutNotes").value
        };

        const workouts = getSavedWorkouts();
        workouts.push(workout);

        if (!saveWorkouts(workouts)) {
            message.textContent =
                "Unable to save your workout. Please try again.";
            message.className = "text-danger mt-2";
            return;
        }

        message.textContent = "Workout saved successfully!";
        message.className = "text-success mt-2";

        workoutForm.reset();
        updateWorkoutFields();
        displayWorkoutHistory();
        updateDashboardWorkoutSummary();
    });
}


// ========================================
// WORKOUT TRACKER: DISPLAY HISTORY
// ========================================

function displayWorkoutHistory() {
    const historyElement = document.getElementById("workoutHistory");

    if (!historyElement) return;

    const workouts = getSavedWorkouts();

    historyElement.replaceChildren();

    if (workouts.length === 0) {
        historyElement.textContent = "No workouts logged yet.";
        return;
    }

    workouts.slice().reverse().forEach(function (workout) {
        const entry = document.createElement("div");
        entry.className = "workout-entry";

        const heading = document.createElement("h3");
        heading.className = "h5";
        heading.textContent = workout.exercise;

        const details = document.createElement("p");
        details.textContent =
            `${workout.date} | ${workout.type}`;

        entry.appendChild(heading);
        entry.appendChild(details);
        historyElement.appendChild(entry);
    });
}


// ========================================
// DASHBOARD: RECENT WORKOUT
// ========================================

function updateDashboardWorkoutSummary() {
    const recentElement = document.getElementById("recentWorkout");

    if (!recentElement) return;

    const workouts = getSavedWorkouts();

    if (workouts.length === 0) {
        recentElement.textContent =
            "Recent Workout: No workouts logged yet.";
    } else {
        const latest = workouts[workouts.length - 1];

        recentElement.textContent =
            `Recent Workout: ${latest.exercise} (${latest.date})`;
    }
}


// ========================================
// INITIALIZE WORKOUT FEATURES
// ========================================

displayWorkoutHistory();
updateDashboardWorkoutSummary();
