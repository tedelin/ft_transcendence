import Verify from './Verify'
import Register from './register'
import Validate from './Validate'
import Congrats from './Congrats'
import LayoutTwoFaSetup from './LayoutTwoFaSetup'

const twoFaRoutes = {
	path: "/two-factor-auth",
	children: [
		{
			path: "setup",
			element: <LayoutTwoFaSetup />,
			children: [
				{
					path: 'register',
					element: <Register />,
				},
				{
					path: 'verify',
					element: <Verify />,
				},
				{
					path: 'congrat',
					element: <Congrats />,
				}
			]
		},
		{
			path: "validate",
			element: <Validate />,
		},
	]
}

export default twoFaRoutes