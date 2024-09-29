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
import Profil from './pages/Profil'
import NewLogin from './pages/new-login'
import { PrivateMessagePage } from './chat/PrivateMessagePage.tsx'
import './styles/App.css';
import './styles/chat.css';
import 'react-toastify/dist/ReactToastify.css';
import { useContext} from 'react';
import { ThemeContext } from './utils/providers/ThemeProvider.tsx';
import { Settings_game } from './game/settings/settings_game.tsx';
import BallSettings from './game/settings/BallSettings/BallSettings.tsx'
import { Paddle } from './game/settings/settings_paddle.tsx';
import { Matchmaking } from './game/Matchmaking';
import { GameProvider } from './components/GameProvider';
import { InGame } from './game/InGame';
import { EndGame } from './game/endGame';
import { ChannelMember } from './chat/ChannelMember';

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "",
				element: <RequireAuth>
					<div>
						<h1>Home</h1>
						<p>Welcome to the home page!</p>
					</div>
				</RequireAuth>
			},
			{
				path: "login",
				element: <Login />,
			},
			{
				path: "profil/:id",
				element: <RequireAuth><Profil/></RequireAuth>
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
						element: <ChannelMember><ChatBox /></ChannelMember>,
					},
					{
						path: "private-messages/:receiverId",
						element: <PrivateMessagePage />,
					},
				]
			},
			{
				path: 'friends',
				element: <RequireAuth><Friends /></RequireAuth>,
			},
			{
				path: "login42",
				element: <NewLogin />,
			},
			{
				path: "settings",
				element: <RequireAuth><Settings /></RequireAuth>
			},
			{
				path: "game",
				element: <RequireAuth><GameProvider><Game /></GameProvider></RequireAuth>,
				children: [
					{
						path: "settings",
						element: <Settings_game />,
						children: [
							{
								path: "ball",
								element: <BallSettings />,
							},
							{
								path: "paddle",
								element: <Paddle />,
							}
						],
					},
					{
						path: "matchmaking",
						element: <Matchmaking />,
					},
					{
						path: "inGame",
						element: <InGame />,
					},
					{
						path: "endGame",
						element: <EndGame />,
					}
				],
			},
			{
				path: "/callback",
				element: <Callback />
			}
		],
	},
	twoFaRoutes,
])

export default function ErrorPage() {
	const error = useRouteError();

	return (
		<div id="error-page">
			<h1>Oops!</h1>
			<p>Sorry, an unexpected error has occurred.</p>
			<p>
				<i>{(error as { error?: string })?.error?.toString() ?? error?.toString()}</i>
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

