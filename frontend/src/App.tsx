import './App.css'
import { RouterProvider, createBrowserRouter, NavLink, Outlet } from 'react-router-dom'
import Signup  from './pages/Signup'
import Home from './pages/Home'
import Login from './pages/Login'
import Chat from './chat/page'
import { NavBar } from './components/NavBar'
import { Game } from './game/page'
import './styles/chat.css'

const Error = () => {
  return (
    <div className='Container'>
      Error : 404, Page not found
    </div>
  )
}

const Router = createBrowserRouter([
  {
    path: '/',
    element : <NavBar />,
    errorElement : <Error />,
    children: [
      {
        path: '/',
        element: <Login />
      },
      {
        path: '/signin',
        element: <Login />
      },
      {
        path: '/signup',
        element: <Signup/>
      },
	  {
		path: '/chat',
		element: <Chat/>
	  },
	  {
		path: '/game',
		element: <Game />
	  },
    ]
  }
]);

function App() {

  return (
    <RouterProvider router={Router}/>
  )
}

export default App
