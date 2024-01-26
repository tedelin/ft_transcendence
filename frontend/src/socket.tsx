import io from 'socket.io-client';

// const token = Cookies.get('access_token');
const token = localStorage.getItem('jwtToken');
const socket = io(import.meta.env.VITE_BACKEND_URL, {
	query: { token },
});


export default socket;