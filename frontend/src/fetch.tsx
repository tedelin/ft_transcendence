const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function fetchUrl(endpoint: string, options = {}) {
  	const url = `${API_BASE_URL}${endpoint}`;
  
  	try {
		const response = await fetch(url, options);

		if (!response.ok) {
			return response.json().then(data => {
				if (data && data.message) {
					throw new Error(data.message);
				} else {
					throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
				}
			});
		};
		const data = await response.json();
		return data;
  	} catch (error) {
    	throw error;
 	}
}

