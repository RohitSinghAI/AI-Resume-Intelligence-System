import API from "./api";

// ==========================================
// SEND QUESTION TO RESUME AI CHAT
// ==========================================

export const askResumeQuestion = async (
  resumeId,
  question,
  chatId = null
) => {
  if (!resumeId) {
    throw new Error("Resume ID is required.");
  }

  if (!question?.trim()) {
    throw new Error("Question is required.");
  }

  const response = await API.post(
    `/chat/resume/${resumeId}`,
    {
      question: question.trim(),
      chat_id: chatId,
    }
  );

  return response.data;
};

// ==========================================
// GET ALL CHAT HISTORY
// ==========================================

export const getChatHistory = async () => {
  const response = await API.get("/chat/chats");

  return response.data;
};

// ==========================================
// GET SINGLE CHAT
// ==========================================

export const getChatById = async (chatId) => {
  if (!chatId) {
    throw new Error("Chat ID is required.");
  }

  const response = await API.get(
    `/chat/chats/${chatId}`
  );

  return response.data;
};