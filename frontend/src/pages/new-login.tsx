import '../styles/new-login.css';
import hero42 from './hero-42.png';

export default function NewLogin() {

	return (
		<div className="login-wrapper">
			<div className="new-login">
				<div className="hero-img">
					<img className= "hero-img-content" src={hero42} alt="hero-42" />
				</div>
				<div className='bottom-wrapper-login'>
					<h1>ft_transcendence</h1>
					<div className='connect'>
						<a href={import.meta.env.VITE_URL_OAUTH}>Connect with 42</a>
					</div>
				</div>
			</div>
		</div>
	);
}