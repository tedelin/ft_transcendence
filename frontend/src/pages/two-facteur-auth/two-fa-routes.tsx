import Verify from './Verify'
import Register from './Register'
import Congrats from './Congrats'
import LayoutTwoFaSetup from './LayoutTwoFaSetup'

export const twoFaRoutes = {
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
	]
}