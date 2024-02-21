export interface Channel {
	name: string;
	visibility: 'PUBLIC' | 'PRIVATE' | 'PROTECTED';
}

export interface Friendship {
	id: number;
	initiatorId: number;
	receiverId: number;
	status: 'ACCEPTED' | 'PENDING' | 'BLOCKED';
}

export interface ChannelMessage {
	id: number;
	content: string;
	sender: User;
	channelId: string;
	timestamp: string;
}

export interface User {
	id: number;
	username: string;
	avatar: string;
	useTwoFa: boolean;
};

export interface ChannelUser {
	user: User;
	channelName: string;
	role: 'MEMBER' | 'BANNED' | 'MUTED' | 'ADMIN' | 'OWNER';
}
