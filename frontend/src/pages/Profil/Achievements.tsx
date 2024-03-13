import { useState, useRef } from 'react';

function BoxAchievement({ achievement }) {
	return (
		<div className="BoxAchievement">
			<h3>{achievement.title}</h3>
			<p>{achievement.description}</p>
		</div>
	);
}

function createAchievementBoxes(achievements) {
	return achievements.map((achievement, index) => (
		<BoxAchievement key={index} achievement={achievement} />
	));
}

function getAchievements(Achievements: any) {
	const achievements: { title: string; description: string; }[] = []; 
	if (Achievements.firstGame)
		achievements.push({ title: 'firstGame', description: 'description' } as { title: string; description: string; });
	if (Achievements.firstWin)
		achievements.push({ title: 'firstWin', description: 'description' } as { title: string; description: string; });
	if (Achievements.firstLoose)
		achievements.push({ title: 'firstLoose', description: 'description' } as { title: string; description: string; });
	if (Achievements.masterWinner)
		achievements.push({ title: 'masterWinner', description: 'description' } as { title: string; description: string; });
	if (Achievements.invincible_guardian)
		achievements.push({ title: 'invincible_guardian', description: 'description' } as { title: string; description: string; });
	if (Achievements.Speed_Demon)
		achievements.push({ title: 'Speed_Demon', description: 'description' } as { title: string; description: string; });
	return achievements;
}

function Achievements(Achievements: any) {
	const [scrollPosition, setScrollPosition] = useState(0);
	const sliderRef = useRef(null);
	const achievements_list = getAchievements(Achievements.Achievement);
	const toRender = createAchievementBoxes(achievements_list);
	const hasEnoughAchievements = achievements_list.length >= 6;

	const scrollLeft = () => {
		if (sliderRef.current) {
			const sliderWidth = sliderRef.current.offsetWidth;
			const scrollAmount = sliderWidth / 5;
			const newScrollPosition = Math.max(scrollPosition - scrollAmount, 0);
			setScrollPosition(newScrollPosition);
		}
	};

	const scrollRight = () => {
		if (sliderRef.current) {
			const sliderWidth = sliderRef.current.offsetWidth;
			const scrollAmount = sliderWidth / 5;
			const maxScrollPosition = sliderRef.current.scrollWidth - sliderWidth;
			const newScrollPosition = Math.min(scrollPosition + scrollAmount, maxScrollPosition);
			setScrollPosition(newScrollPosition);
		}
	};

	const isAtStart = scrollPosition === 0;
	const isAtEnd = sliderRef.current ? scrollPosition >= (sliderRef.current.scrollWidth - sliderRef.current.offsetWidth) : false;

	return (
		<div className="Achievements">
			<button className={`navCaroussel left ${!hasEnoughAchievements || isAtStart ? 'end-nav-caroussel' : ''}`} onClick={scrollLeft}>
				<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
					<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
				</svg>
			</button>
			<div className="sliderWrapper">
				<div className="slider" ref={sliderRef} style={{ transform: `translateX(-${scrollPosition}px)` }}>
					{toRender}
				</div>
			</div>
			<button className={`navCaroussel right ${!hasEnoughAchievements || isAtEnd ? 'end-nav-caroussel' : ''}`} onClick={scrollRight}>
				<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
					<path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
				</svg>
			</button>
		</div>
	);
}

export default Achievements;

