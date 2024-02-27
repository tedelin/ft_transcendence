import pictureA from './pictureA.jpg';


function Infos(id: any) {
	const name = id;
	return (
		<div className="Infos">
			<div className="profil-picture">
				<img src={pictureA} alt="profil-picture"></img>
			</div>
			<div className="side-Infos">
				<div className="pseudo">@name</div>
				<div className="actions">
					<button className="add">add</button>
					<button className="message">message</button>
					<button className="play">Invite to play</button>
				</div>
				<div className="Bio">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sed sem aliquam, pulvinar dui eget, interdum sapien.</div>
			</div>
		</div>
	);
}

export default Infos;