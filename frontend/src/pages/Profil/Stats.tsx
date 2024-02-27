function Stats(id : any) {
	const Win = 3;
	const Losses = 2;
	const Ratio = Win / Losses;
	return (
		<div className="Stats">
			<div className="Wins">Wins
				<div className="data-stats">{Win}</div>
			</div>
			<div className="Ratio">Ratio
				<div className="data-stats">{Ratio}</div>
			</div>
			<div className="Losses">Losses
				<div className="data-stats">{Losses}</div>
			</div>
		</div>
	);
}

export default Stats;