export type ID = string;

export type ReactionType = 'heart' | 'laugh' | 'fire' | 'sad' | 'angry' | 'wow';

export interface User {
  id: ID;
  displayName: string;
  username: string;
  bio: string;
  avatarSeed: string;
  joinedAt: string;
  verified: boolean;
  followersCount: number;
  followingCount: number;
  messagesCount: number;
}

export interface Reaction {
  type: ReactionType;
  count: number;
}

export interface Message {
  id: ID;
  receiverId: ID;
  senderId: ID | null; // null = anonymous
  isAnonymous: boolean;
  body: string;
  createdAt: string;
  isPublic: boolean;
  isDeleted: boolean;
  reactions: Reaction[];
  replyCount: number;
  myReaction: ReactionType | null;
  senderDisplayName?: string; // for visible messages
  senderUsername?: string;
}

export interface Reply {
  id: ID;
  messageId: ID;
  parentId: ID | null; // null = direct reply to message
  authorId: ID; // always a real user (the receiver or a participant)
  body: string;
  createdAt: string;
  isDeleted: boolean;
  isHidden: boolean; // receiver can hide replies
  reactions: Reaction[];
  myReaction: ReactionType | null;
  authorDisplayName: string;
  authorUsername: string;
  authorAvatarSeed: string;
  children: Reply[];
}

export interface Notification {
  id: ID;
  type: 'message' | 'reply' | 'reaction' | 'follow' | 'publish';
  actorName: string;
  actorAvatarSeed: string;
  body: string;
  createdAt: string;
  read: boolean;
  link: string;
}

export interface AuthState {
  user: User | null;
  isVerified: boolean;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
}
