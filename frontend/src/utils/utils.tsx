export function getAvatar(img: any) {
	return import.meta.env.VITE_BACKEND_URL + "/users/avatars/" + img;
}