import { useLocation, Outlet, Navigate, createBrowserRouter, RouterProvider, useRouteError } from 'react-router-dom';
import Login from './pages/Login';
import Chat from './chat/page';
import { NavBar } from './components/NavBar';
import { Game } from './game/page';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Settings from './pages/Settings';
import { Channels } from './chat/Channels';
import { Friends } from './chat/Friends';
import { ChatBox } from './chat/ChatBox';
import { ToastContainer } from 'react-toastify';
import { twoFaRoutes } from './pages/two-facteur-auth/two-fa-routes';
import { Callback } from './components/Callback.tsx';
import { PrivateMessagePage } from './chat/PrivateMessagePage.tsx'
import './styles/App.css';
import './styles/chat.css';
import 'react-toastify/dist/ReactToastify.css';
import { useContext } from 'react';
import { ThemeContext } from './utils/providers/ThemeProvider.tsx';

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "",
				element: <div className='chatArea'></div>
			},
			{
				path: "chat",
				element: <RequireAuth><Chat /></RequireAuth>,
				children: [
					{
						path: 'channels',
						element: <Channels />,
					},
					{
						path: 'channels/:name',
						element: <ChatBox />,
					},
					{
						path: 'friends',
						element: <Friends />,
					},
					{
						path: "private-messages/:receiverId",
						element: <PrivateMessagePage />,
					},
				]
			},
			{
				path: "login",
				element: <Login />
			},
			{
				path: "settings",
				element: <RequireAuth><Settings /></RequireAuth>
			},
			{
				path: "game",
				element: <RequireAuth><Game /></RequireAuth>
			},
			{
				path: "/callback",
				element: <Callback />
			}
		],
	},
	twoFaRoutes
])

export default function ErrorPage() {
	const error = useRouteError();

	return (
		<div id="error-page">
			<h1>Oops!</h1>
			<p>Sorry, an unexpected error has occurred.</p>
			<p>
				<i>{error?.error?.toString() ?? error?.toString()}</i>
			</p>
		</div>
	);
}

function Layout() {
	const { theme } = useContext(ThemeContext);

	return (
		<div className={`App ${theme}`}>
			<AuthProvider>
				<div className='container'>
					<NavBar />
					<Outlet />
				</div>
				<ToastContainer theme={theme} />
			</AuthProvider>
		</div>
	)
}

function RequireAuth({ children }: { children: JSX.Element }) {
	let auth = useAuth();
	let location = useLocation();

	if (auth?.loading) {
		return <div>Loading...</div>
	}

	if (!auth?.user) {
		return <Navigate to="/login" state={{ from: location }} replace />
	}

	return children;
}

export function App() {
	return (
		<RouterProvider router={router} />
	);
}

