function Stats(stats : any) {
	const losses = stats.stats.nbLoose;
	let Ratio = stats.stats.nbWin / stats.stats.nbLoose;
	if(losses === 0)
		Ratio = stats.stats.nbWin;
	console.log("stats.stats.nbWin", stats.stats.nbWin);
	console.log("stats : ", stats);
	return (
		<div className="Stats">
			<div className="Wins">Wins
				<div className="data-stats">{stats.stats.nbWin}</div>
			</div>
			<div className="Ratio">Ratio
				<div className="data-stats">{Ratio}</div>
			</div>
			<div className="Losses">Losses
				<div className="data-stats">{stats.stats.nbLoose}</div>
			</div>
		</div>
	);
}

export default Stats;