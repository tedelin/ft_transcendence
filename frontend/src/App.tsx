import { useLocation, Outlet, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Chat from './chat/page'
import { NavBar } from './components/NavBar'
import { Game } from './game/page'
import { AuthProvider, useUser } from './components/AuthProvider'
import './App.css'
import './styles/chat.css'

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
	let auth = useUser();
	let location = useLocation();

	if (auth?.loading) {
		return <div>Loading...</div>
	}

	if (!auth?.user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}
	return children;
}

function App() {
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

export default App
