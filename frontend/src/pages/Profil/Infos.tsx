function Infos(Infos : any) {
	const add = () => {
		alert("Need to setup add function");
	}
	const message = () => {
		alert("Need to setup message function");
	}
	const play = () => {
		alert("Need to setup play function");
	}

	return (
		<div className="Infos">
			<div className="profil-picture">
				<img src={Infos.avatar} alt="profil-picture"></img>
			</div>
			<div className="side-Infos">
				<div className="pseudo">@{Infos.username}</div>
				<div className="actions">
					<button className="add" onClick={add}>add</button>
					<button className="message" onClick={message}>message</button>
					<button className="play" onClick={play}>Invite to play</button>
				</div>
				<div className="Bio">
					{Infos.bio}</div>
				</div>
		</div>
	);
}

export default Infos;