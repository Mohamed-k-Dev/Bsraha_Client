import type {
  User,
  Message,
  Reply,
  Notification,
  ReactionType,
  Reaction,
  ID,
} from '@/types';
import { sleep, sortReactionsByCount } from '@/utils';

const now = Date.now();
const ago = (ms: number) => new Date(now - ms).toISOString();

// ─── Users ────────────────────────────────────────────────────────────────────

export const CURRENT_USER: User = {
  id: 'u_me',
  displayName: 'You',
  username: 'you',
  bio: 'Building things, breaking things, writing about both. Open to anonymous honesty.',
  avatarSeed: 'you-seed-9',
  joinedAt: ago(1000 * 60 * 60 * 24 * 120),
  verified: true,
  followersCount: 342,
  followingCount: 189,
  messagesCount: 47,
};

const USERS: User[] = [
  CURRENT_USER,
  {
    id: 'u_lina',
    displayName: 'Lina Okafor',
    username: 'linaokafor',
    bio: 'Product designer. I sketch in margins. Receiver of many anonymous truths.',
    avatarSeed: 'lina-7x',
    joinedAt: ago(1000 * 60 * 60 * 24 * 300),
    verified: true,
    followersCount: 1240,
    followingCount: 412,
    messagesCount: 203,
  },
  {
    id: 'u_marc',
    displayName: 'Marc Devereaux',
    username: 'marcdvx',
    bio: 'Sound engineer & occasional writer. Say what you want — I will not flinch.',
    avatarSeed: 'marc-3k',
    joinedAt: ago(1000 * 60 * 60 * 24 * 210),
    verified: false,
    followersCount: 876,
    followingCount: 301,
    messagesCount: 156,
  },
  {
    id: 'u_sahar',
    displayName: 'Sahar Mirzai',
    username: 'saharmz',
    bio: 'Poet, pharmacist, and a little bit of a ghost. Leave me a verse.',
    avatarSeed: 'sahar-2m',
    joinedAt: ago(1000 * 60 * 60 * 24 * 180),
    verified: true,
    followersCount: 2103,
    followingCount: 540,
    messagesCount: 389,
  },
  {
    id: 'u_juno',
    displayName: 'Juno Hale',
    username: 'junohale',
    bio: 'Filmmaker. I collect anonymous confessions for a documentary. Maybe yours.',
    avatarSeed: 'juno-5p',
    joinedAt: ago(1000 * 60 * 60 * 24 * 90),
    verified: false,
    followersCount: 530,
    followingCount: 220,
    messagesCount: 64,
  },
  {
    id: 'u_Theo',
    displayName: 'Theo Bright',
    username: 'theobright',
    bio: 'Stand-up comic. Roast me anonymously — I dare you.',
    avatarSeed: 'theo-1q',
    joinedAt: ago(1000 * 60 * 60 * 24 * 45),
    verified: false,
    followersCount: 210,
    followingCount: 98,
    messagesCount: 31,
  },
  {
    id: 'u_nadia',
    displayName: 'Nadia Farouk',
    username: 'nadiaf',
    bio: 'Astrophysicist in training. Tell me something that scares you about the dark.',
    avatarSeed: 'nadia-6z',
    joinedAt: ago(1000 * 60 * 60 * 24 * 250),
    verified: true,
    followersCount: 1840,
    followingCount: 267,
    messagesCount: 421,
  },
  {
    id: 'u_ravi',
    displayName: 'Ravi Kapoor',
    username: 'ravikapoor',
    bio: 'Chef. I cook for strangers. Anonymous feedback welcome, brutal or kind.',
    avatarSeed: 'ravi-8w',
    joinedAt: ago(1000 * 60 * 60 * 24 * 150),
    verified: false,
    followersCount: 690,
    followingCount: 150,
    messagesCount: 88,
  },
  {
    id: 'u_iris',
    displayName: 'Iris Lindqvist',
    username: 'irisl',
    bio: 'Therapist by day, anonymous letter writer by night.',
    avatarSeed: 'iris-4t',
    joinedAt: ago(1000 * 60 * 60 * 24 * 330),
    verified: true,
    followersCount: 3200,
    followingCount: 89,
    messagesCount: 512,
  },
  {
    id: 'u_keita',
    displayName: 'Keita Sato',
    username: 'keitasato',
    bio: 'Game developer. I make worlds where nobody knows your name either.',
    avatarSeed: 'keita-0r',
    joinedAt: ago(1000 * 60 * 60 * 24 * 60),
    verified: false,
    followersCount: 410,
    followingCount: 175,
    messagesCount: 52,
  },
];

function makeReactions(map: Partial<Record<ReactionType, number>>): Reaction[] {
  const all: Reaction[] = (Object.keys(map) as ReactionType[]).map((type) => ({
    type,
    count: map[type]!,
  }));
  return sortReactionsByCount(all);
}

// ─── Messages ─────────────────────────────────────────────────────────────────

const MESSAGE_BODIES = [
  "I have been pretending to enjoy my job for three years. Today I finally admitted to myself that I only stay because I'm afraid of disappointing my parents.",
  "Your last post about failure made me cry in a café. I did not know strangers could see me that clearly.",
  "I think you are the most honest person on this app and it makes me furious because I wish I could be like that.",
  "Nobody in my real life knows I write poetry. Your page is the only place I have ever shared a line.",
  "I sent you a message six months ago telling you your art was mediocre. I was wrong. I was just jealous. I am sorry.",
  "Every time you post something about loneliness I feel like you are writing directly to me. Are you?",
  "I have read everything you have published here at least four times. You describe feelings I could never name.",
  "You once replied to my anonymous message with more kindness than anyone in my family has ever shown me. Thank you.",
  "I am the person who left the fire reaction on your message about your father. I lost mine last year. I could not write the words. That reaction was all I had.",
  "I disagree with almost everything you say and I still think you are the most important voice on this platform.",
];

const MESSAGES: Message[] = [
  {
    id: 'm_1',
    receiverId: 'u_me',
    senderId: null,
    isAnonymous: true,
    body: MESSAGE_BODIES[0],
    createdAt: ago(1000 * 60 * 60 * 3),
    isPublic: true,
    isDeleted: false,
    reactions: makeReactions({ heart: 142, fire: 38, sad: 67, wow: 12, laugh: 3 }),
    replyCount: 8,
    myReaction: 'heart',
  },
  {
    id: 'm_2',
    receiverId: 'u_me',
    senderId: 'u_lina',
    isAnonymous: false,
    body: MESSAGE_BODIES[1],
    createdAt: ago(1000 * 60 * 60 * 8),
    isPublic: true,
    isDeleted: false,
    reactions: makeReactions({ heart: 89, sad: 24, wow: 7 }),
    replyCount: 4,
    myReaction: null,
    senderDisplayName: 'Lina Okafor',
    senderUsername: 'linaokafor',
  },
  {
    id: 'm_3',
    receiverId: 'u_me',
    senderId: null,
    isAnonymous: true,
    body: MESSAGE_BODIES[2],
    createdAt: ago(1000 * 60 * 60 * 20),
    isPublic: false,
    isDeleted: false,
    reactions: makeReactions({ angry: 15, fire: 41, heart: 22 }),
    replyCount: 2,
    myReaction: null,
  },
  {
    id: 'm_4',
    receiverId: 'u_me',
    senderId: null,
    isAnonymous: true,
    body: MESSAGE_BODIES[3],
    createdAt: ago(1000 * 60 * 60 * 30),
    isPublic: true,
    isDeleted: false,
    reactions: makeReactions({ heart: 203, sad: 51, wow: 28, fire: 19 }),
    replyCount: 12,
    myReaction: 'heart',
  },
  {
    id: 'm_5',
    receiverId: 'u_me',
    senderId: 'u_sahar',
    isAnonymous: false,
    body: MESSAGE_BODIES[4],
    createdAt: ago(1000 * 60 * 60 * 48),
    isPublic: true,
    isDeleted: false,
    reactions: makeReactions({ heart: 340, fire: 77, sad: 15, wow: 9, laugh: 4 }),
    replyCount: 23,
    myReaction: 'fire',
    senderDisplayName: 'Sahar Mirzai',
    senderUsername: 'saharmz',
  },
  {
    id: 'm_6',
    receiverId: 'u_me',
    senderId: null,
    isAnonymous: true,
    body: MESSAGE_BODIES[5],
    createdAt: ago(1000 * 60 * 60 * 72),
    isPublic: false,
    isDeleted: false,
    reactions: makeReactions({ heart: 12, sad: 8 }),
    replyCount: 0,
    myReaction: null,
  },
  {
    id: 'm_7',
    receiverId: 'u_me',
    senderId: null,
    isAnonymous: true,
    body: MESSAGE_BODIES[6],
    createdAt: ago(1000 * 60 * 60 * 96),
    isPublic: true,
    isDeleted: false,
    reactions: makeReactions({ heart: 167, wow: 44, fire: 21, sad: 18 }),
    replyCount: 6,
    myReaction: null,
  },
  {
    id: 'm_8',
    receiverId: 'u_me',
    senderId: 'u_iris',
    isAnonymous: false,
    body: MESSAGE_BODIES[7],
    createdAt: ago(1000 * 60 * 60 * 120),
    isPublic: false,
    isDeleted: false,
    reactions: makeReactions({ heart: 88, fire: 12 }),
    replyCount: 3,
    myReaction: 'heart',
    senderDisplayName: 'Iris Lindqvist',
    senderUsername: 'irisl',
  },
  {
    id: 'm_9',
    receiverId: 'u_me',
    senderId: null,
    isAnonymous: true,
    body: MESSAGE_BODIES[8],
    createdAt: ago(1000 * 60 * 60 * 24 * 7),
    isPublic: true,
    isDeleted: false,
    reactions: makeReactions({ heart: 412, sad: 156, fire: 89, wow: 34 }),
    replyCount: 31,
    myReaction: 'heart',
  },
  {
    id: 'm_10',
    receiverId: 'u_me',
    senderId: null,
    isAnonymous: true,
    body: MESSAGE_BODIES[9],
    createdAt: ago(1000 * 60 * 60 * 24 * 10),
    isPublic: true,
    isDeleted: false,
    reactions: makeReactions({ angry: 23, fire: 56, heart: 78, laugh: 12 }),
    replyCount: 9,
    myReaction: null,
  },
  {
    id: 'm_11',
    receiverId: 'u_me',
    senderId: null,
    isAnonymous: true,
    body: "You once posted that vulnerability is not a weakness. I have been thinking about it for weeks. I still cannot decide if I believe you.",
    createdAt: ago(1000 * 60 * 60 * 24 * 14),
    isPublic: false,
    isDeleted: false,
    reactions: makeReactions({ heart: 34, wow: 11, sad: 6 }),
    replyCount: 1,
    myReaction: null,
  },
  {
    id: 'm_12',
    receiverId: 'u_me',
    senderId: null,
    isAnonymous: true,
    body: "I found your profile through a friend. I have never told anyone this, but your words made me call my mother for the first time in two years.",
    createdAt: ago(1000 * 60 * 60 * 24 * 20),
    isPublic: true,
    isDeleted: false,
    reactions: makeReactions({ heart: 521, sad: 98, fire: 43, wow: 22 }),
    replyCount: 18,
    myReaction: 'heart',
  },
];

// ─── Replies (tree) ───────────────────────────────────────────────────────────

function reply(
  id: ID,
  messageId: ID,
  parentId: ID | null,
  author: User,
  body: string,
  createdAgoMs: number,
  reactions: Partial<Record<ReactionType, number>>,
  children: Reply[] = [],
  opts: Partial<Pick<Reply, 'isDeleted' | 'isHidden'>> = {}
): Reply {
  return {
    id,
    messageId,
    parentId,
    authorId: author.id,
    body,
    createdAt: ago(createdAgoMs),
    isDeleted: opts.isDeleted ?? false,
    isHidden: opts.isHidden ?? false,
    reactions: makeReactions(reactions),
    myReaction: null,
    authorDisplayName: author.displayName,
    authorUsername: author.username,
    authorAvatarSeed: author.avatarSeed,
    children,
  };
}

const REPLIES_M1: Reply[] = [
  reply('r_1', 'm_1', null, CURRENT_USER, 'This is the most honest thing anyone has ever sent me. I am saving it. Thank you for trusting me with it.', 1000 * 60 * 60 * 2.5, { heart: 67, fire: 12, wow: 8 }, [
    reply('r_2', 'm_1', 'r_1', USERS[1], 'You responded with more grace than I would have. That is why I wrote to you.', 1000 * 60 * 60 * 2, { heart: 34, wow: 5 }, [
      reply('r_3', 'm_1', 'r_2', USERS[3], 'This thread is making me reconsider everything I complain about. Thank you both.', 1000 * 60 * 60 * 1.5, { heart: 22, sad: 4 }, [
        reply('r_4', 'm_1', 'r_3', USERS[6], 'Threads like this are the reason I open this app.', 1000 * 60 * 60 * 1, { heart: 18, fire: 3 }),
      ]),
    ]),
    reply('r_5', 'm_1', 'r_1', USERS[8], 'I felt this in my chest. The fear of disappointing people is the heaviest quiet weight.', 1000 * 60 * 60 * 1.8, { heart: 29, sad: 11 }),
  ]),
  reply('r_6', 'm_1', null, USERS[4], 'I am in the same place. Reading this made me feel less alone. I hope you find your way out.', 1000 * 60 * 60 * 2.2, { heart: 45, sad: 14, fire: 6 }, [
    reply('r_7', 'm_1', 'r_6', CURRENT_USER, 'You are not alone in it. That is the whole point of this place.', 1000 * 60 * 60 * 2, { heart: 28, wow: 4 }),
  ]),
  reply('r_8', 'm_1', null, USERS[5], 'The part about parents is so real. I stayed in law school for five years for the same reason.', 1000 * 60 * 60 * 1, { heart: 19, sad: 7, angry: 2 }, [], { isDeleted: false }),
];

const REPLIES_M5: Reply[] = [
  reply('r_20', 'm_5', null, CURRENT_USER, 'It took courage to come back and say that. I respect it more than you know. Apology accepted, warmly.', 1000 * 60 * 60 * 47, { heart: 156, fire: 23, wow: 12 }, [
    reply('r_21', 'm_5', 'r_20', USERS[4], 'I did not expect kindness. That makes it harder and easier at the same time.', 1000 * 60 * 60 * 46, { heart: 78, sad: 14, wow: 6 }, [
      reply('r_22', 'm_5', 'r_21', USERS[2], 'This is why Bsraha exists. Not for the clever replies. For this.', 1000 * 60 * 60 * 45, { heart: 92, fire: 18, wow: 7 }, [
        reply('r_23', 'm_5', 'r_22', CURRENT_USER, 'Exactly.', 1000 * 60 * 60 * 44, { heart: 41 }),
        reply('r_24', 'm_5', 'r_22', USERS[7], 'Saving this entire thread. It is a masterclass in being human.', 1000 * 60 * 60 * 43, { heart: 33, wow: 8 }),
      ]),
    ]),
  ]),
  reply('r_25', 'm_5', null, USERS[6], 'We have all been the jealous one. The brave part is coming back.', 1000 * 60 * 60 * 40, { heart: 54, fire: 9 }),
  reply('r_26', 'm_5', null, USERS[1], 'This thread restored my faith in anonymous platforms. People can be good.', 1000 * 60 * 60 * 36, { heart: 67, wow: 11, fire: 5 }),
];

const REPLIES_M9: Reply[] = [
  reply('r_30', 'm_9', null, CURRENT_USER, 'I do not know who you are, but I am holding space for your grief. That reaction meant more than any words could have.', 1000 * 60 * 60 * 24 * 6.9, { heart: 234, sad: 56, wow: 18, fire: 12 }, [
    reply('r_31', 'm_9', 'r_30', USERS[8], 'I am crying reading this. I lost my dad in March. I could not write it either. The fire was all I had too.', 1000 * 60 * 60 * 24 * 6.8, { heart: 189, sad: 78, wow: 14 }, [
      reply('r_32', 'm_9', 'r_31', USERS[3], 'To everyone in this thread: you are not alone. Grief is the price of love.', 1000 * 60 * 60 * 24 * 6.5, { heart: 145, sad: 34, fire: 8 }, [
        reply('r_33', 'm_9', 'r_32', USERS[6], 'The price of love. I am writing that down.', 1000 * 60 * 60 * 24 * 6, { heart: 67, wow: 9 }),
        reply('r_34', 'm_9', 'r_32', USERS[2], 'This is the most beautiful thread I have ever seen on the internet.', 1000 * 60 * 60 * 24 * 5, { heart: 88, fire: 12, wow: 7 }),
      ]),
    ]),
  ]),
  reply('r_35', 'm_9', null, USERS[7], 'I am a therapist and I want to screenshot this and put it on my wall. The permission to grieve without words.', 1000 * 60 * 60 * 24 * 5.5, { heart: 102, wow: 23, fire: 6 }),
];

const REPLIES_M4: Reply[] = [
  reply('r_40', 'm_4', null, CURRENT_USER, 'Poetry is the most honest thing a person can make. Please never stop sharing it here.', 1000 * 60 * 60 * 29, { heart: 78, fire: 15, wow: 9 }, [
    reply('r_41', 'm_4', 'r_40', USERS[3], 'You are the first person who ever told me that. I will not stop.', 1000 * 60 * 60 * 28, { heart: 56, sad: 8, wow: 4 }, [
      reply('r_42', 'm_4', 'r_41', USERS[1], 'Share more. We are listening.', 1000 * 60 * 60 * 27, { heart: 34 }),
      reply('r_43', 'm_4', 'r_41', USERS[6], 'This thread is a poem itself.', 1000 * 60 * 60 * 26, { heart: 29, wow: 6 }, [], { isDeleted: false }),
    ]),
  ]),
  reply('r_44', 'm_4', null, USERS[8], 'I have a notebook full of poems I have never shown anyone. This makes me want to change that.', 1000 * 60 * 60 * 20, { heart: 45, wow: 12, fire: 4 }),
];

const REPLIES_M12: Reply[] = [
  reply('r_50', 'm_12', null, CURRENT_USER, 'I do not know what to say. I am so glad you called. Your mother is lucky to have you.', 1000 * 60 * 60 * 24 * 19, { heart: 312, sad: 45, fire: 23, wow: 12 }, [
    reply('r_51', 'm_12', 'r_50', USERS[6], 'This is the best thing I have read all week.', 1000 * 60 * 60 * 24 * 18, { heart: 89, fire: 8 }),
  ]),
  reply('r_52', 'm_12', null, USERS[2], 'Bsraha is not an app. It is a phone call home.', 1000 * 60 * 60 * 24 * 17, { heart: 156, wow: 34, fire: 11 }),
];

const REPLIES_BY_MESSAGE: Record<ID, Reply[]> = {
  m_1: REPLIES_M1,
  m_5: REPLIES_M5,
  m_9: REPLIES_M9,
  m_4: REPLIES_M4,
  m_12: REPLIES_M12,
};

// ─── Notifications ────────────────────────────────────────────────────────────

const NOTIFICATIONS: Notification[] = [
  {
    id: 'n_1',
    type: 'message',
    actorName: 'Anonymous',
    actorAvatarSeed: 'anon-1',
    body: 'sent you a new message',
    createdAt: ago(1000 * 60 * 30),
    read: false,
    link: '/messages/m_1',
  },
  {
    id: 'n_2',
    type: 'reaction',
    actorName: 'Lina Okafor',
    actorAvatarSeed: 'lina-7x',
    body: 'reacted ❤️ to your reply',
    createdAt: ago(1000 * 60 * 60 * 2),
    read: false,
    link: '/messages/m_2',
  },
  {
    id: 'n_3',
    type: 'reply',
    actorName: 'Sahar Mirzai',
    actorAvatarSeed: 'sahar-2m',
    body: 'replied to your message',
    createdAt: ago(1000 * 60 * 60 * 5),
    read: false,
    link: '/messages/m_5',
  },
  {
    id: 'n_4',
    type: 'reaction',
    actorName: 'Anonymous',
    actorAvatarSeed: 'anon-2',
    body: 'reacted 🔥 to your published message',
    createdAt: ago(1000 * 60 * 60 * 9),
    read: true,
    link: '/messages/m_9',
  },
  {
    id: 'n_5',
    type: 'follow',
    actorName: 'Iris Lindqvist',
    actorAvatarSeed: 'iris-4t',
    body: 'started following you',
    createdAt: ago(1000 * 60 * 60 * 14),
    read: true,
    link: '/profile/irisl',
  },
  {
    id: 'n_6',
    type: 'reply',
    actorName: 'Juno Hale',
    actorAvatarSeed: 'juno-5p',
    body: 'replied in a thread you are part of',
    createdAt: ago(1000 * 60 * 60 * 20),
    read: true,
    link: '/messages/m_1/replies/r_4',
  },
  {
    id: 'n_7',
    type: 'publish',
    actorName: 'System',
    actorAvatarSeed: 'system-0',
    body: 'Your published message reached 500 reactions',
    createdAt: ago(1000 * 60 * 60 * 24),
    read: true,
    link: '/messages/m_12',
  },
  {
    id: 'n_8',
    type: 'message',
    actorName: 'Marc Devereaux',
    actorAvatarSeed: 'marc-3k',
    body: 'sent you a visible message',
    createdAt: ago(1000 * 60 * 60 * 26),
    read: true,
    link: '/messages/m_2',
  },
];

// ─── Simulated API ────────────────────────────────────────────────────────────

const DB = {
  users: [...USERS],
  messages: [...MESSAGES],
  repliesByMessage: { ...REPLIES_BY_MESSAGE },
  notifications: [...NOTIFICATIONS],
};

export const mockApi = {
  async login(email: string, _password: string): Promise<{ user: User; verified: boolean }> {
    await sleep(700);
    if (!email.includes('@')) throw new Error('Please enter a valid email address.');
    return { user: CURRENT_USER, verified: true };
  },

  async signup(displayName: string, email: string, _password: string): Promise<{ user: User; verified: boolean }> {
    await sleep(900);
    if (!displayName.trim()) throw new Error('Please enter your display name.');
    if (!email.includes('@')) throw new Error('Please enter a valid email address.');
    return { user: { ...CURRENT_USER, displayName, verified: false }, verified: false };
  },

  async verifyEmail(_code: string): Promise<{ verified: boolean }> {
    await sleep(600);
    return { verified: true };
  },

  async resendCode(): Promise<{ ok: boolean }> {
    await sleep(400);
    return { ok: true };
  },

  async getMyMessages(filter: 'all' | 'public' | 'private' = 'all'): Promise<Message[]> {
    await sleep(500);
    let msgs = DB.messages.filter((m) => m.receiverId === 'u_me' && !m.isDeleted);
    if (filter === 'public') msgs = msgs.filter((m) => m.isPublic);
    if (filter === 'private') msgs = msgs.filter((m) => !m.isPublic);
    return [...msgs].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },

  async getMessage(id: ID): Promise<Message | null> {
    await sleep(400);
    return DB.messages.find((m) => m.id === id) ?? null;
  },

  async getMessageReplies(messageId: ID): Promise<Reply[]> {
    await sleep(400);
    return DB.repliesByMessage[messageId] ?? [];
  },

  async togglePublish(messageId: ID): Promise<{ isPublic: boolean }> {
    await sleep(300);
    const msg = DB.messages.find((m) => m.id === messageId);
    if (msg) msg.isPublic = !msg.isPublic;
    return { isPublic: msg?.isPublic ?? false };
  },

  async sendMessage(receiverId: ID, body: string, isAnonymous: boolean): Promise<Message> {
    await sleep(600);
    const newMsg: Message = {
      id: 'm_' + Math.random().toString(36).slice(2, 9),
      receiverId,
      senderId: isAnonymous ? null : 'u_me',
      isAnonymous,
      body,
      createdAt: new Date().toISOString(),
      isPublic: false,
      isDeleted: false,
      reactions: [],
      replyCount: 0,
      myReaction: null,
      senderDisplayName: isAnonymous ? undefined : CURRENT_USER.displayName,
      senderUsername: isAnonymous ? undefined : CURRENT_USER.username,
    };
    DB.messages.unshift(newMsg);
    return newMsg;
  },

  async addReply(messageId: ID, parentId: ID | null, body: string): Promise<Reply> {
    await sleep(500);
    const newReply: Reply = {
      id: 'r_' + Math.random().toString(36).slice(2, 9),
      messageId,
      parentId,
      authorId: 'u_me',
      body,
      createdAt: new Date().toISOString(),
      isDeleted: false,
      isHidden: false,
      reactions: [],
      myReaction: null,
      authorDisplayName: CURRENT_USER.displayName,
      authorUsername: CURRENT_USER.username,
      authorAvatarSeed: CURRENT_USER.avatarSeed,
      children: [],
    };
    const tree = DB.repliesByMessage[messageId] ?? [];
    if (parentId === null) {
      tree.push(newReply);
    } else {
      const insert = (nodes: Reply[]): boolean => {
        for (const n of nodes) {
          if (n.id === parentId) {
            n.children.push(newReply);
            return true;
          }
          if (insert(n.children)) return true;
        }
        return false;
      };
      insert(tree);
    }
    DB.repliesByMessage[messageId] = tree;
    const msg = DB.messages.find((m) => m.id === messageId);
    if (msg) msg.replyCount++;
    return newReply;
  },

  async deleteReply(messageId: ID, replyId: ID): Promise<{ ok: boolean }> {
    await sleep(300);
    const tree = DB.repliesByMessage[messageId];
    if (!tree) return { ok: false };
    const mark = (nodes: Reply[]): boolean => {
      for (const n of nodes) {
        if (n.id === replyId) {
          n.isDeleted = true;
          n.body = '';
          return true;
        }
        if (mark(n.children)) return true;
      }
      return false;
    };
    mark(tree);
    return { ok: true };
  },

  async toggleReplyVisibility(messageId: ID, replyId: ID): Promise<{ isHidden: boolean }> {
    await sleep(300);
    const tree = DB.repliesByMessage[messageId];
    if (!tree) return { isHidden: false };
    const toggle = (nodes: Reply[]): boolean => {
      for (const n of nodes) {
        if (n.id === replyId) {
          n.isHidden = !n.isHidden;
          return true;
        }
        if (toggle(n.children)) return true;
      }
      return false;
    };
    toggle(tree);
    const r = findReplyById(tree, replyId);
    return { isHidden: r?.isHidden ?? false };
  },

  async reactToMessage(messageId: ID, type: ReactionType): Promise<{ reactions: Reaction[]; myReaction: ReactionType | null }> {
    await sleep(200);
    const msg = DB.messages.find((m) => m.id === messageId);
    if (!msg) return { reactions: [], myReaction: null };
    applyReaction(msg.reactions, type, msg.myReaction);
    msg.myReaction = msg.myReaction === type ? null : type;
    return { reactions: sortReactionsByCount(msg.reactions), myReaction: msg.myReaction };
  },

  async reactToReply(messageId: ID, replyId: ID, type: ReactionType): Promise<{ reactions: Reaction[]; myReaction: ReactionType | null }> {
    await sleep(200);
    const tree = DB.repliesByMessage[messageId];
    if (!tree) return { reactions: [], myReaction: null };
    const r = findReplyById(tree, replyId);
    if (!r) return { reactions: [], myReaction: null };
    applyReaction(r.reactions, type, r.myReaction);
    r.myReaction = r.myReaction === type ? null : type;
    return { reactions: sortReactionsByCount(r.reactions), myReaction: r.myReaction };
  },

  async getNotifications(): Promise<Notification[]> {
    await sleep(400);
    return [...DB.notifications].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },

  async markNotificationRead(id: ID): Promise<{ ok: boolean }> {
    await sleep(150);
    const n = DB.notifications.find((x) => x.id === id);
    if (n) n.read = true;
    return { ok: true };
  },

  async markAllNotificationsRead(): Promise<{ ok: boolean }> {
    await sleep(300);
    DB.notifications.forEach((n) => (n.read = true));
    return { ok: true };
  },

  async searchUsers(query: string, page: number = 1, perPage: number = 6): Promise<{ users: User[]; total: number; hasMore: boolean }> {
    await sleep(500);
    const q = query.trim().toLowerCase();
    let results = DB.users.filter((u) => u.id !== 'u_me');
    if (q) {
      results = results.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      );
    }
    const total = results.length;
    const start = (page - 1) * perPage;
    const pageItems = results.slice(start, start + perPage);
    return { users: pageItems, total, hasMore: start + perPage < total };
  },

  async getUserByUsername(username: string): Promise<User | null> {
    await sleep(400);
    return DB.users.find((u) => u.username === username) ?? null;
  },

  async getUserPublishedMessages(userId: ID): Promise<Message[]> {
    await sleep(400);
    return DB.messages
      .filter((m) => m.receiverId === userId && m.isPublic && !m.isDeleted)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },

  async updateProfile(updates: Partial<Pick<User, 'displayName' | 'bio' | 'username'>>): Promise<User> {
    await sleep(500);
    Object.assign(CURRENT_USER, updates);
    return CURRENT_USER;
  },

  async getUnreadNotificationCount(): Promise<number> {
    return DB.notifications.filter((n) => !n.read).length;
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findReplyById(replies: Reply[], id: ID): Reply | null {
  for (const r of replies) {
    if (r.id === id) return r;
    const child = findReplyById(r.children, id);
    if (child) return child;
  }
  return null;
}

function applyReaction(reactions: Reaction[], type: ReactionType, current: ReactionType | null) {
  const existing = reactions.find((r) => r.type === type);
  if (current === type) {
    if (existing) existing.count = Math.max(0, existing.count - 1);
    if (existing && existing.count === 0) {
      const idx = reactions.indexOf(existing);
      reactions.splice(idx, 1);
    }
  } else {
    if (current) {
      const prev = reactions.find((r) => r.type === current);
      if (prev) prev.count = Math.max(0, prev.count - 1);
      if (prev && prev.count === 0) {
        const idx = reactions.indexOf(prev);
        reactions.splice(idx, 1);
      }
    }
    if (existing) existing.count++;
    else reactions.push({ type, count: 1 });
  }
}

export { USERS };
