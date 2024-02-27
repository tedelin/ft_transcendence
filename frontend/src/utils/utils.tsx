export function getAvatar(img: any) {
	return import.meta.env.VITE_BACKEND_URL + "/users/avatars/" + img;
}

export function validateInput(input, pattern) {
	const regex = new RegExp(pattern);
	return regex.test(input);
  }