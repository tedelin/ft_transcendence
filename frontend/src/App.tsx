import { useLocation, Outlet, Routes, Route, Navigate, createBrowserRouter, RouterProvider} from 'react-router-dom'
import { useEffect } from 'react'
import Login from './pages/Login'
import Chat from './chat/page'
import { NavBar } from './components/NavBar'
import { Game } from './game/page'
import { AuthProvider, useAuth } from './components/AuthProvider'
import './App.css'
import './styles/chat.css'

const router = createBrowserRouter([
    { path: '*', Component: Root },
]);

function Layout() {
	return (
		<>
			<NavBar />
			<div className='container'>
				<Outlet />
			</div>
		</>
	)
}

function RequireAuth({children}: {children: JSX.Element}) {
	let auth = useAuth();
	let location = useLocation();

	if (auth?.loading) {
		return <div>Loading...</div>
	}

	if (!auth?.user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}
	return children;
}

function Root() {

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const token = urlParams.get('token');
	  
		if (token) {
		  localStorage.setItem('jwtToken', token);
		  document.location.search = '';
		}
	  }, []);

	return (
		<AuthProvider>
			<Routes>
				<Route element={<Layout />}>
					<Route path="/" element={<Login />} />
					<Route path="/login" element={<Login />} />
					<Route 
						path="/game" 
						element={
						<RequireAuth>
							<Game />
						</RequireAuth>}
					/>
					<Route 
						path="/chat" 
						element={
						<RequireAuth>
							<Chat />
						</RequireAuth>}
					/>
				</Route>
			</Routes>
		</AuthProvider>
	)
}

function App() {
    return <RouterProvider router={router} />;
}

export default App
