// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const API_BASE_URL = "http://localhost:3001";

export async function fetchUrl(endpoint: string, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error with fetch:', error.message);
    throw error;
  }
}

