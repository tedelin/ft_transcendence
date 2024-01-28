import { useState } from 'react';
import { useChat } from './ChatContext';
import '../styles/chat.css';


function AddFriend({ selected }) {
	return ((selected === "AddFriend" &&
		<div className='createChannelContainer'>
			<input className="searchBar" type="text" placeholder="You can add friends by typing their username" />
			<button className='createButton'>
				Send Friend Request
			</button>
		</div>
	));
}

function FriendsTopBar({ setSelected, selected }) {
	const options = ["Online", "All", "Pending", "Blocked"];

	const handleOptionClick = (option: string) => {
		setSelected(option);
	};

	return (
		<div className='friendsTopBar'>
			<span className='material-symbols-outlined'>
				group
			</span>
			<span className='spanMargin'>
				Friends
			</span>
			{options.map((option) => (
				<div
					key={option}
					className={`topBarAction${selected === option ? "Selected" : ""}`}
					onClick={() => handleOptionClick(option)}
				>
					<div>{option}</div>
				</div>
			))}
			<div className='addFriendAction' onClick={() => setSelected("AddFriend")}>
				<span>Add Friend</span>
			</div>
		</div>
	);
}


function SearchFriends({ selected }) {
	return (
		(selected !== "AddFriend" && <>
			<input className="searchBar" type="text" placeholder="Search friends" />
		</>)
	);
}

function FriendsList({ selected }) {
	return ((selected !== "AddFriend" &&
		<div className='friendsList'>

		</div>
	));
}


export function Friends() {
	const chat = useChat();
	const [selected, setSelected] = useState("Online");

	return (
		(chat.active === 'friends' && (
			<div className='chatArea'>
				<FriendsTopBar selected={selected} setSelected={setSelected} />
				<AddFriend selected={selected} />
				<SearchFriends selected={selected} />
				<FriendsList selected={selected} />
			</div>
		))
	);
}