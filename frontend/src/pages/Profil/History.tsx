import pictureA from './pictureA.jpg';
import pictureB from './pictureB.png';


function MatchBox({ match, playerId }) {
	const isWinner = match.winner == playerId.id;
	const player = match.player1.id == playerId.id ? match.player1 : match.player2;
	const opponent = match.player1.id == playerId.id ? match.player2 : match.player1;
	console.log(isWinner)
	console.log(player)
	console.log(opponent)

	return (
		<div className="MatchBox">
			<div className={`player ${isWinner ? 'winner-p' : 'loser-p'}`}>
				<div className="player-name">
					<button className='clickable'>{player.name}</button></div>
				<div className="player-picture">
					<button className='clickable'>
						<img src={player.picture} alt="player-picture" />
					</button>
				</div>

			</div>
			<div className="score">{match.score}</div>
			<div className={`player ${!isWinner ? 'winner-p' : 'loser-p'}`}>
				<div className="player-picture right-p">
					<button className='clickable'>
						<img src={opponent.picture} alt="opponent-picture" />
					</button>
				</div>
				<div className="player-name">
					<button className='clickable'>{opponent.name}</button>
				</div>
			</div>
		</div>
	);
}

function createMatchBoxes(matchs, playerId) {
	return matchs.map((match, index) => (
		<MatchBox key={index} match={match} playerId={playerId} />
	));
}

function History(matchs : any, playerId: any) {
	console.log("matchs : ", matchs);
	const placeholder = [
		{ player1: { id: 1, name: 'Joueur A', picture: pictureA }, player2: { id: 3, name: 'Joueur C', picture: pictureB }, score: '2 - 1', winner: 1, loser: 3 },
		{ player1: { id: 1, name: 'Joueur A', picture: pictureA }, player2: { id: 4, name: 'Joueur D', picture: pictureB }, score: '1 - 2', winner: 4, loser: 1 },
		{ player1: { id: 1, name: 'Joueur A', picture: pictureA }, player2: { id: 5, name: 'Joueur E', picture: pictureB }, score: '2 - 0', winner: 1, loser: 5 },
		{ player1: { id: 1, name: 'Joueur A', picture: pictureA }, player2: { id: 6, name: 'Joueur F', picture: pictureB }, score: '0 - 2', winner: 6, loser: 1 },
		{ player1: { id: 1, name: 'Joueur A', picture: pictureA }, player2: { id: 7, name: 'Joueur G', picture: pictureB }, score: '2 - 1', winner: 1, loser: 7 },
		{ player1: { id: 1, name: 'Joueur A', picture: pictureA }, player2: { id: 8, name: 'Joueur H', picture: pictureB }, score: '1 - 2', winner: 8, loser: 1 },
		{ player1: { id: 1, name: 'Joueur A', picture: pictureA }, player2: { id: 9, name: 'Joueur I', picture: pictureB }, score: '2 - 0', winner: 1, loser: 9 },
		{ player1: { id: 1, name: 'Joueur A', picture: pictureA }, player2: { id: 10, name: 'Joueur J', picture: pictureB }, score: '0 - 2', winner: 10, loser: 1 },
	];
	const toRender = createMatchBoxes(placeholder, playerId);

	return (
		<div className="History">
			{toRender}
		</div>
	);
}

export default History;
