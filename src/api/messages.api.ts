import { api } from "./axios";

export const getUserStats = async () => {
  const response = await api.get("/message/stats/overview");
  return response.data?.data?.stats;
};

export const getMessages = async (params?: {
  filter?: string;
  page?: number;
  limit?: number;
}) => {
  const res = await api.get(`/message`, {
    params: {
      filter: params?.filter || "all",
      page: params?.page || 1,
      limit: params?.limit || 10,
    },
  });
  return res.data?.data || { messages: [], pagination: {} };
};

export const getMessageById = async (messageId: string) => {
  const res = await api.get(`/message/${messageId}`);
  return res.data?.data?.message || null;
};

export const sendMessage = async ({
  displayName,
  content,
  isAnonymous,
}: {
  displayName: string;
  content: string;
  isAnonymous: boolean;
}) => {
  const res = await api.post(
    `/message/send/to/${encodeURIComponent(displayName)}`,
    {
      content,
      isAnonymous,
    }
  );
  return res.data;
};

export const getMessageReplies = async (messageId: string, page = 1) => {
  const res = await api.get(`/message/${messageId}/replies`, {
    params: { page, limit: 10 },
  });
  const data = res.data?.data || { replies: [], pagination: {} };

  const normalizedReplies = (data.replies || []).map((r: any) => ({
    ...r,
    id: r._id || r.id,
    body: r.content || r.body, // Map backend content to frontend body
    authorDisplayName:
      r.sender?.displayName || r.authorDisplayName || "Anonymous",
    authorAvatarSeed: r.sender?.userName || r.sender?._id || "seed",
    authorId: r.sender?._id || r.sender,
    // Ensure reactions is always an iterable array
    reactions: Array.isArray(r.reactions)
      ? r.reactions
      : r.reactions?.types || r.reactionSummary?.types || [],
    myReaction: r.myReaction || r.reactions?.myReaction || null,
    children: r.children || [],
  }));

  return { ...data, replies: normalizedReplies };
};

export const createMessageReply = async ({
  messageId,
  content,
  isAnonymous,
}: {
  messageId: string;
  content: string;
  isAnonymous: boolean;
}) => {
  const res = await api.post(`/message/${messageId}/reply`, {
    content,
    isAnonymous,
  });

  const rawReply = res.data?.data?.reply;

  return {
    ...rawReply,
    id: rawReply._id || rawReply.id,
    body: rawReply.content || rawReply.body,
    authorDisplayName:
      rawReply.sender?.displayName || rawReply.authorDisplayName || "Anonymous",
    authorAvatarSeed:
      rawReply.sender?.userName || rawReply.sender?._id || "seed",
    authorId: rawReply.sender?._id || rawReply.sender,
    reactions: Array.isArray(rawReply.reactions)
      ? rawReply.reactions
      : rawReply.reactions?.types || rawReply.reactionSummary?.types || [],
    myReaction: rawReply.myReaction || rawReply.reactions?.myReaction || null,
    children: rawReply.children || [],
  };
};

export const getReplyReplies = async (replyId: string, page = 1) => {
  const res = await api.get(`/reply/${replyId}/replies`, {
    params: { page, limit: 10 },
  });
  const data = res.data?.data || { replies: [], pagination: {} };

  const normalizedReplies = (data.replies || []).map((r: any) => ({
    ...r,
    id: r._id || r.id,
    body: r.content || r.body,
    authorDisplayName:
      r.sender?.displayName || r.authorDisplayName || "Anonymous",
    authorAvatarSeed: r.sender?.userName || r.sender?._id || "seed",
    authorId: r.sender?._id || r.sender,
    reactions: Array.isArray(r.reactions)
      ? r.reactions
      : r.reactions?.types || [],
    myReaction: r.myReaction || r.reactions?.myReaction || null,
    children: r.children || [],
  }));

  return { ...data, replies: normalizedReplies };
};

export const createReplyToReply = async ({
  replyId,
  content,
  isAnonymous,
}: {
  replyId: string;
  content: string;
  isAnonymous: boolean;
}) => {
  const res = await api.post(`/reply/to/${replyId}`, {
    content,
    isAnonymous,
  });

  const rawReply = res.data?.data?.reply;
  return {
    ...rawReply,
    id: rawReply._id || rawReply.id,
    body: rawReply.content || rawReply.body,
    authorDisplayName:
      rawReply.sender?.displayName || rawReply.authorDisplayName || "Anonymous",
    authorAvatarSeed:
      rawReply.sender?.userName || rawReply.sender?._id || "seed",
    authorId: rawReply.sender?._id || rawReply.sender,
    reactions: Array.isArray(rawReply.reactions) ? rawReply.reactions : [],
    myReaction: null,
    children: [],
  };
};

export const reactToReply = async ({
  replyId,
  type,
}: {
  replyId: string;
  type: string;
}) => {
  const res = await api.post(`/reaction/reply/${replyId}`, { type });
  return res.data?.data;
};

export const deleteMessageReply = async (replyId: string) => {
  const res = await api.delete(`/reply/${replyId}`);
  return res.data;
};

export const updateMessageRepliesVisibility = async ({
  messageId,
  showReplies,
}: {
  messageId: string;
  showReplies: boolean;
}) => {
  const res = await api.patch(`/message/${messageId}/replies-visibility`, {
    showReplies,
  });
  return res.data;
};
