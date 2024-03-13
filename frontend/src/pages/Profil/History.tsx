import { getAvatar } from '../../utils/utils';
import { NavLink } from 'react-router-dom';

function MatchBox({ match, playerId }) {
	const isWinner = match.winner == playerId;
	const player = match.player1.id == playerId ? match.player1 :  match.player2;
	const opponent = match.player1.id == playerId ? match.player2 :  match.player1;
	const linkToOpponent = `/profil/${opponent.id}`

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
			<div className="scoreProfil">
				<div className="player-score">{player.score}</div>
				<div>-</div>
				<div className="opponent-score">{opponent.score}</div>
			</div>
			<div className={`player ${!isWinner ? 'winner-p' : 'loser-p'}`}>
				<div className="player-picture right-p">
					<NavLink to={linkToOpponent} className='clickable'>
						<img src={opponent.picture} alt="opponent-picture" />
					</NavLink>
				</div>
				<div className="player-name">
					<NavLink to={linkToOpponent} className='clickable'>{opponent.name}</NavLink>
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

function filterMatchesByPlayerId(matchs, id) {
	return matchs.filter(match =>
	  match.players.some(player => player.playerId == id)
	);
  }

  function transformMatch(match) {
	const pictureA = getAvatar(match.players[0].player.avatar);
	const pictureB = getAvatar(match.players[1].player.avatar);
  
	const player1 = match.players[0].player;
	const player2 = match.players[1].player;
  
	const score1 = match.players[0].score;
	const score2 = match.players[1].score;
  
	const winner = score1 > score2 ? player1.id : player2.id;
	const loser = score1 > score2 ? player2.id : player1.id;
  
	return {
	  player1: { id: player1.id, name: player1.username, picture: pictureA, score : score1},
	  player2: { id: player2.id, name: player2.username, picture: pictureB, score : score2 },
	  winner: winner,
	  loser: loser
	};
  }

  function getFormattedMatches(matchs) {
	return matchs.map(match => transformMatch(match));
  }
  
  

function History({ match, userId } : any) {
	if(match[0] == undefined)
		return (<div></div>)
	const myMatchs = filterMatchesByPlayerId(match, userId);
	const toRender = createMatchBoxes(getFormattedMatches(myMatchs), userId);

	return (
		<div className="History">
			{toRender}
		</div>
	);
}

export default History;
