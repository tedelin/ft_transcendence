import { useEffect, useState } from 'react';
import { useChat } from './ChatContext';
import { fetchUrl } from '../fetch';
import { useAuth } from '../components/AuthProvider';
import '../styles/chat.css';


function AddFriend({ selected }) {
	const [username, setUsername] = useState('');
	const [user, setUser] = useState(null);
	const token = localStorage.getItem('jwtToken');

	async function getUser() {
		try {
			const response = await fetchUrl(`/users/${username}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setUser(response);
		} catch (error) {
			alert('fail');
		}
	}

	async function sendRequest() {
		await getUser();
		try {
			await fetchUrl(`/users/${user?.id}/friends`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			alert('Friend request sent!');
		} catch (error) {
			console.log(error);
			alert('fail send');
		}
	}

	return ((selected === "AddFriend" &&
		<div className='createChannelContainer'>
			<input 
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				className="searchBar" 
				type="text"
				placeholder="You can add friends by typing their username"
			/>
			<button className='createButton' onClick={sendRequest}>
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
	const [friends, setFriends] = useState([]);
	const token = localStorage.getItem('jwtToken');
	const auth = useAuth();

	async function acceptFriendRequest(requestId: string) {
		try {
			await fetchUrl(`/users/${requestId}/friends/accept`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			 
		} catch (error) {
			alert(error);
		}
	}

	async function declineFriendRequest(requestId: string) {
		try {
			await fetchUrl(`/users/${requestId}/friends/decline`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
		} catch (error) {
			alert(error);
		}
	}

	async function getFriends() {
		const token = localStorage.getItem('jwtToken');
		try {
			const response = await fetchUrl("/users/friends", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			// console.log(response);
			setFriends(response);
		} catch (error) {
			alert(error);
		}
	}

	useEffect(() => {
		getFriends();
	}, []);
	
	const filteredFriends = friends.filter((friend) => {
		if (selected === "Pending") {
			return friend.status === "PENDING" && friend.initiatorId !== auth?.user?.id;
		} else if (selected === "All") {
			return friend.status === "ACCEPTED";
		} else if (selected === "Blocked") {
			return friend.status === "BLOCKED";
		} else {
			return friend.status === "Accepted";
		}
	});

	return (
		selected !== "AddFriend" && (
			<div className='friendsList'>
				{filteredFriends.length > 0 && filteredFriends.map((friend: any) => (
					<div className='friendListItem' key={friend.id}>
						<span className='sideBarChatName'>
							{friend.id}
						</span>
						{/* <div className='friendStatus'>
							{friend.status}
						</div> */}
						{friend.status === "PENDING" && (
							<div className='friendActions'>
								<button className='acceptFriend' onClick={() => acceptFriendRequest(friend.id)}>
									Accept
								</button>
								<button className='declineFriend' onClick={() => declineFriendRequest(friend.id)}>
									Decline
								</button>
							</div>
						)}
					</div>
				))}
			</div>
		)
	);
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