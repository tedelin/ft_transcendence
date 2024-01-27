import { useState } from 'react';
import { useChat } from './ChatContext';
import '../styles/chat.css';


function FriendsTopBar() {
	const options = ["Online", "All", "Pending", "Blocked"];
	const [selected, setSelected] = useState("Online");
  
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
		<div className='addFriendAction'>
		  <span>Add Friend</span>
		</div>
	  </div>
	);
}
  

function SearchFriends() {
	return (
		<>
			<input className="searchBar" type="text" placeholder="Search friends" />
		</>
	);
}

function FriendsList() {
	return (
		<div className='friendsList'>
			
		</div>
	);
}


export function Friends() {
    const chat = useChat();
	
	return (
		(chat.active === 'friends' && (
			<div className='chatArea'>
				<FriendsTopBar />
				<SearchFriends />
				<FriendsList />
			</div>
		))
	);
}