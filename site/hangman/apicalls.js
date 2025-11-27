//const API_BASE_URL = "http://localhost:8080"; 
const API_BASE_URL = "https://hangman-api-production-120c.up.railway.app"; 


async function createGame(gameData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log("Game created:", data);
    return data;
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
}

async function getGameByName(gameName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/games/${gameName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 404) {
      console.log(`Game with name "${gameName}" not found.`);
      return null; // Return null if the game is not found
    }
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log("Game fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching game:", error);
    throw error;
  }
}

async function getAttemptsByGameName(gameName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/games/attempts?gameName=${encodeURIComponent(gameName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 404) {
      console.log(`Attempts for game "${gameName}" not found.`);
      return []; // Return empty array when no attempts
    }
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log("Attempts fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching attempts:", error);
    throw error;
  }
}

async function fetchGames() {
  try {
    //const response = await fetch('https://hangman-api-production-120c.up.railway.app/api/games'); // Replace with your actual API URL
    const response = await fetch(`${API_BASE_URL}/api/games`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }); // Replace with your actual API URL
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading games:", error);
    throw error;
  }
}

async function createAttempt(gameId, attemptData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/games/${gameId}/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(attemptData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log("Attempt created:", data);
    return data;
  } catch (error) {
    console.error("Error creating attempt:", error);
    throw error;
  }
}

async function updateGame(gameId, gameData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/games/${gameId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log("Game updated:", data);
    return data;
  } catch (error) {
    console.error("Error updating game:", error);
    throw error;
  }
}

window.fetchGames = fetchGames;
window.createGame = createGame;
window.getGameByName = getGameByName;
window.getAttemptsByGameName = getAttemptsByGameName;
window.createAttempt = createAttempt;
window.updateGame = updateGame;
