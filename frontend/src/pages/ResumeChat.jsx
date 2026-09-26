import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  Send,
  Bot,
  User,
  Loader2,
  MessageSquare,
  Plus,
  History,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";

import ReactMarkdown from "react-markdown";

import {
  askResumeQuestion,
  getChatHistory,
  getChatById,
} from "../services/chatApi";


const ResumeChat = () => {
  const { resumeId } = useParams();

  // ============================================================
  // STATE
  // ============================================================

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatError, setChatError] = useState("");

  // AI typing effect
  const [typingMessage, setTypingMessage] = useState("");

  // Auto-scroll reference
  const chatEndRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // Cleanup typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  // Suggested questions
  const suggestedQuestions = [
    "What are my strongest technical skills?",
    "What projects have I worked on?",
    "What is my work experience?",
    "What are my missing skills?",
    "Give me a summary of my resume.",
    "What technologies have I used?",
  ];


  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading, typingMessage]);


  // ============================================================
  // GET ALL CHATS
  // ============================================================

  const fetchChats = useCallback(async () => {
    try {
      const data = await getChatHistory();

      const chatList = Array.isArray(data)
        ? data
        : Array.isArray(data?.chats)
          ? data.chats
          : [];

      const currentResumeChats = chatList.filter(
        (chat) => String(chat.resume_id) === String(resumeId)
      );

      setChats(currentResumeChats);
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  }, [resumeId]);


  // ============================================================
  // LOAD CHATS ON PAGE LOAD
  // ============================================================

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);


  // ============================================================
  // LOAD PARTICULAR CHAT
  // ============================================================

  const loadChat = async (selectedChatId) => {
    setChatLoading(true);

    try {
      const data = await getChatById(selectedChatId);

      setChatId(data.chat_id);

      setMessages(data.messages || []);
      setChatError("");

      setSidebarOpen(false);

    } catch (error) {

      console.error(
        "Failed to load chat:",
        error
      );

      setChatError(
        error.response?.data?.detail ||
          error.message ||
          "Failed to load this conversation."
      );

    } finally {

      setChatLoading(false);

    }
  };


  // ============================================================
  // NEW CHAT
  // ============================================================

  const createNewChat = () => {
    setChatId(null);
    setMessages([]);
    setQuestion("");
    setTypingMessage("");
    setChatError("");
    setSidebarOpen(false);
  };


  // ============================================================
  // SUGGESTED QUESTION
  // ============================================================

  const askSuggestedQuestion = (suggestion) => {
    if (loading) return;
    setQuestion(suggestion);
  };


  // ============================================================
  // TYPE AI RESPONSE
  // ============================================================

  const typeAIResponse = (fullResponse) => {
    return new Promise((resolve) => {
      let index = 0;

      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }

      setTypingMessage("");

      typingIntervalRef.current = setInterval(() => {
        index += 2;

        const currentText = fullResponse.slice(0, index);

        setTypingMessage(currentText);

        if (index >= fullResponse.length) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: fullResponse,
            },
          ]);

          setTypingMessage("");
          resolve();
        }
      }, 15);
    });
  };


  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const sendMessage = async () => {

    if (!question.trim() || loading) {
      return;
    }

    const userQuestion = question.trim();

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setQuestion("");
    setChatError("");
    setLoading(true);

    try {
      const data = await askResumeQuestion(
        resumeId,
        userQuestion,
        chatId
      );

      // Save chat ID
      setChatId(data.chat_id);

      // Type AI response like ChatGPT
      await typeAIResponse(data.answer);

      // Refresh sidebar
      await fetchChats();

    } catch (error) {

      console.error(
        "Chat error:",
        error
      );

      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Something went wrong. Please try again.";

      setChatError(errorMessage);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);

    } finally {

      setLoading(false);

    }
  };


  // ============================================================
  // ENTER KEY
  // ============================================================

  useEffect(() => {
    if (question.trim()) {
      setChatError("");
    }
  }, [question]);

  const handleKeyDown = (e) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      sendMessage();
    }
  };


  // ============================================================
  // MARKDOWN COMPONENTS
  // ============================================================

  const markdownComponents = {

    h1: ({ children }) => (
      <h1 className="mb-3 mt-2 text-xl font-bold text-gray-900">
        {children}
      </h1>
    ),

    h2: ({ children }) => (
      <h2 className="mb-2 mt-4 text-lg font-bold text-gray-900">
        {children}
      </h2>
    ),

    h3: ({ children }) => (
      <h3 className="mb-2 mt-3 text-base font-semibold text-gray-900">
        {children}
      </h3>
    ),

    p: ({ children }) => (
      <p className="mb-2 leading-6">
        {children}
      </p>
    ),

    ul: ({ children }) => (
      <ul className="mb-3 ml-5 list-disc space-y-1">
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol className="mb-3 ml-5 list-decimal space-y-1">
        {children}
      </ol>
    ),

    li: ({ children }) => (
      <li className="leading-6">
        {children}
      </li>
    ),

    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900">
        {children}
      </strong>
    ),

    em: ({ children }) => (
      <em className="italic">
        {children}
      </em>
    ),

    code: ({ children }) => (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm text-gray-800">
        {children}
      </code>
    ),

    blockquote: ({ children }) => (
      <blockquote className="my-3 border-l-4 border-indigo-400 pl-4 italic text-gray-600">
        {children}
      </blockquote>
    ),
  };


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex h-screen bg-gray-50">

      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-40
          flex
          w-72
          flex-col
          border-r
          bg-white
          transition-transform
          duration-300
          md:static
          md:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* Sidebar Header */}

        <div className="flex items-center justify-between border-b px-4 py-4">

          <div className="flex items-center gap-2">

            <div className="rounded-lg bg-indigo-100 p-2">

              <MessageSquare
                className="h-5 w-5 text-indigo-600"
              />

            </div>

            <h2 className="font-semibold text-gray-900">
              Resume AI
            </h2>

          </div>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close chat sidebar"
            className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
          >

            <X className="h-5 w-5" />

          </button>

        </div>


        {/* New Chat */}

        <div className="p-3">

          <button
            onClick={createNewChat}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-indigo-600
              px-4
              py-3
              text-sm
              font-medium
              text-white
              transition
              hover:bg-indigo-700
            "
          >

            <Plus className="h-5 w-5" />

            New Chat

          </button>

        </div>


        {/* Resume Chats */}

        <div className="flex items-center gap-2 px-4 pb-2 pt-2">

          <History className="h-4 w-4 text-gray-500" />

          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Resume Chats
          </span>

          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            {chats.length}
          </span>

        </div>


        {/* Chat List */}

        <div className="flex-1 overflow-y-auto px-2 pb-4">

          {chats.length === 0 ? (

            <div className="px-3 py-8 text-center">

              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-300" />

              <p className="text-sm text-gray-400">
                No chats yet
              </p>

            </div>

          ) : (

            <div className="space-y-1">

              {chats.map((chat) => (

                <button
                  key={chat.id}
                  type="button"
                  onClick={() =>
                    loadChat(chat.id)
                  }
                  className={`
                    w-full
                    rounded-xl
                    px-3
                    py-3
                    text-left
                    transition
                    ${
                      chatId === chat.id
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >

                  <div className="flex items-start gap-3">

                    <MessageSquare
                      className={`
                        mt-0.5
                        h-4
                        w-4
                        shrink-0
                        ${
                          chatId === chat.id
                            ? "text-indigo-600"
                            : "text-gray-400"
                        }
                      `}
                    />

                    <div className="min-w-0">

                      <p className="truncate text-sm font-medium">
                        {chat.title || "New Chat"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Resume #{chat.resume_id}
                      </p>

                    </div>

                  </div>

                </button>

              ))}

            </div>

          )}

        </div>


        {/* Sidebar Footer */}

        <div className="border-t p-4">

          <p className="text-center text-xs text-gray-400">
            AI Resume Intelligence
          </p>

        </div>

      </aside>


      {/* ======================================================
          MAIN CHAT
      ====================================================== */}

      <main className="flex min-w-0 flex-1 flex-col">


        {/* Header */}

        <header className="flex items-center gap-3 border-b bg-white px-4 py-4">

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open chat sidebar"
            className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
          >

            <Menu className="h-5 w-5" />

          </button>


          <div className="rounded-xl bg-indigo-100 p-2">

            <MessageSquare
              className="h-5 w-5 text-indigo-600"
            />

          </div>


          <div className="min-w-0 flex-1">

            <h1 className="truncate text-lg font-semibold text-gray-900">
              AI Resume Assistant
            </h1>

            <p className="truncate text-sm text-gray-500">
              Ask questions about this resume
            </p>

          </div>

          <Link
            to={`/resumes/${resumeId}`}
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 sm:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resume
          </Link>

        </header>


        {/* Messages */}

        <div className="flex-1 overflow-y-auto px-4 py-6">

          <div className="mx-auto max-w-4xl space-y-5">

            {/* Chat Loading */}

            {chatLoading && (

              <div className="flex min-h-[400px] items-center justify-center">

                <div className="flex items-center gap-2 text-sm text-gray-500">

                  <Loader2
                    className="h-5 w-5 animate-spin"
                  />

                  Loading conversation...

                </div>

              </div>

            )}


            {/* Empty Chat */}

            {!chatLoading &&
              messages.length === 0 && (

                <div className="flex min-h-[400px] items-center justify-center">

                  <div className="w-full max-w-2xl text-center">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">

                      <Bot
                        className="h-8 w-8 text-indigo-600"
                      />

                    </div>

                    <h2 className="text-xl font-semibold text-gray-900">
                      Ask anything about the resume
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Ask about skills, experience, projects,
                      education, certifications, or AI analysis.
                    </p>

                    {/* Suggested Questions */}
                    <div className="mt-8 grid gap-3 sm:grid-cols-2">

                      {suggestedQuestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => askSuggestedQuestion(suggestion)}
                          disabled={loading}
                          className="
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            px-4
                            py-3
                            text-left
                            text-sm
                            text-gray-700
                            shadow-sm
                            transition
                            hover:border-indigo-300
                            hover:bg-indigo-50
                            hover:text-indigo-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          <div className="flex items-center gap-3">
                            <MessageSquare
                              className="h-4 w-4 shrink-0 text-indigo-500"
                            />

                            <span>{suggestion}</span>
                          </div>
                        </button>
                      ))}

                    </div>

                  </div>

                </div>

              )}



            {!chatLoading &&
              messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={`
                      flex
                      gap-3
                      ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }
                    `}
                  >

                    {/* AI Icon */}

                    {message.role === "assistant" && (

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100">

                        <Bot
                          className="h-5 w-5 text-indigo-600"
                        />

                      </div>

                    )}


                    {/* Message */}

                    <div
                      className={`
                        max-w-[80%]
                        rounded-2xl
                        px-4
                        py-3
                        text-sm
                        leading-6
                        ${
                          message.role === "user"
                            ? "rounded-br-md bg-indigo-600 text-white"
                            : "rounded-bl-md border bg-white text-gray-800 shadow-sm"
                        }
                      `}
                    >

                      {message.role === "assistant" ? (

                        <ReactMarkdown
                          components={
                            markdownComponents
                          }
                        >
                          {message.content}
                        </ReactMarkdown>

                      ) : (

                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>

                      )}

                    </div>


                    {/* User Icon */}

                    {message.role === "user" && (

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200">

                        <User
                          className="h-5 w-5 text-gray-600"
                        />

                      </div>

                    )}

                  </div>

                )
              )}


            {/* AI Typing Response */}

            {typingMessage && (
              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                  <Bot className="h-5 w-5 text-indigo-600" />
                </div>

                <div className="max-w-[80%] rounded-2xl rounded-bl-md border bg-white px-4 py-3 text-sm leading-6 text-gray-800 shadow-sm">

                  <ReactMarkdown components={markdownComponents}>
                    {typingMessage}
                  </ReactMarkdown>

                  <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-indigo-500 align-middle" />

                </div>

              </div>
            )}


            {/* AI Loading */}

            {loading && !typingMessage && (

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100">

                  <Bot
                    className="h-5 w-5 text-indigo-600"
                  />

                </div>


                <div className="rounded-2xl rounded-bl-md border bg-white px-4 py-3 shadow-sm">

                  <div className="flex items-center gap-2 text-sm text-gray-500">

                    <Loader2
                      className="h-4 w-4 animate-spin"
                    />

                    AI is thinking...

                  </div>

                </div>

              </div>

            )}


            {/* AUTO SCROLL TARGET */}

            <div ref={chatEndRef} />

          </div>

        </div>


        {/* Input */}

        <div className="border-t bg-white p-4">
          {chatError && (
            <div
              className="mx-auto mb-3 max-w-4xl rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
              role="alert"
            >
              {chatError}
            </div>
          )}

          <div className="mx-auto flex max-w-4xl items-end gap-3">

            <textarea
              aria-label="Ask a question about the resume"
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask something about this resume..."
              rows={1}
              disabled={loading}
              className="
                min-h-[48px]
                flex-1
                resize-none
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-100
                disabled:bg-gray-100
              "
            />


            <button
              type="button"
              onClick={sendMessage}
              disabled={
                !question.trim() ||
                loading
              }
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-indigo-600
                text-white
                transition
                hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {loading ? (

                <Loader2
                  className="h-5 w-5 animate-spin"
                />

              ) : (

                <Send className="h-5 w-5" />

              )}

            </button>

          </div>


          <p className="mt-2 text-center text-xs text-gray-400">
            Press Enter to send • Shift + Enter for a new line
          </p>

        </div>

      </main>

    </div>
  );
};


export default ResumeChat;