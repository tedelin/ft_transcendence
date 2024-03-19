export interface Channel {
	name: string;
	visibility: string;
}

export interface PrivateMessage {
	id: number;
	receiver: User;
	sender: User;
	content: string;
	timestamp: string;
}

export interface Friendship {
	id: number;
	initiatorId: number;
	receiverId: number;
	receiver: User;
	initiator: User;
	status: 'ACCEPTED' | 'PENDING' | 'BLOCKED';
}

export interface User {
	id: number;
	username: string;
	avatar: string;
	useTwoFA: boolean;
	bio : string | null;
	status: 'ONLINE' | 'OFFLINE' | 'IN_GAME';
};

export interface ChannelMessage {
	id: number;
	content: string;
	sender: User;
	channelId: string;
	timestamp: string;
}


export interface ChannelUser {
	user: User;
	roomId: string;
	role?: 'MEMBER' | 'BANNED' | 'MUTED' | 'ADMIN' | 'OWNER';
	muted: boolean;
}


export interface ProfilData {
	username?: string;
	bio?: string;
	avatar?: string;
	stats?: number;
	Achievement?: string;
	error?: string;
  }
  
export interface UseStepReturn {
setStep: (step: number) => void;
setAuth: (auth: boolean) => void;
}