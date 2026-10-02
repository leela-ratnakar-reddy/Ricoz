"use client";

import React, { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/Button";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "@/lib/storage";
import { Conversation, Message } from "@/types";
import { Send, ShieldCheck } from "lucide-react";

export default function DesignerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const convs = getConversations();
    setConversations(convs);
    if (convs.length > 0 && !activeConvId) {
      setActiveConvId(convs[0].id);
      setMessages(getMessages(convs[0].id));
    } else if (activeConvId) {
      setMessages(getMessages(activeConvId));
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("brandroom_messages_updated", loadData);
    return () => window.removeEventListener("brandroom_messages_updated", loadData);
  }, [activeConvId]);

  useEffect(() => {
    if (activeConvId) {
      setMessages(getMessages(activeConvId));
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !activeConvId) return;

    sendMessage(activeConvId, inputVal.trim(), "Alex Morgan (Creative Director)");
    setInputVal("");
    setMessages(getMessages(activeConvId));
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <DashboardSidebar role="designer" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col h-[calc(100vh-5rem)]">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-border shrink-0">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-medium block mb-0.5">
                STUDIO INBOX
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                Client Discussions
              </h1>
            </div>
            <div className="text-xs font-mono text-brand-muted">
              Direct Enterprise Inquiries
            </div>
          </div>

          <div className="flex-1 bg-surface/80 border border-surface-border rounded-xl shadow-subtle flex flex-col md:flex-row overflow-hidden min-h-0">
            {/* Sidebar */}
            <div className="w-full md:w-80 border-r border-surface-border flex flex-col shrink-0 bg-surface-elevated/40">
              <div className="p-3 border-b border-surface-border">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-muted block px-2">
                  Client Dialogues ({conversations.length})
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-surface-border">
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setActiveConvId(conv.id)}
                      className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                        isActive
                          ? "bg-surface-elevated border-l-2 border-accent"
                          : "hover:bg-surface-elevated/50"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-surface-elevated text-brand font-mono text-xs flex items-center justify-center font-bold shrink-0 border border-surface-border">
                        {conv.participantAvatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-medium text-brand truncate">
                            {conv.participantName}
                          </span>
                          <span className="text-[10px] font-mono text-brand-muted shrink-0">
                            {conv.lastMessageTime}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-secondary font-mono truncate mb-1">
                          {conv.projectName || "Rebrand"}
                        </p>
                        <p className="text-xs text-brand-muted truncate font-light">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 flex flex-col min-w-0 bg-surface/90">
              {activeConversation ? (
                <>
                  <div className="p-4 border-b border-surface-border flex items-center justify-between shrink-0 bg-surface">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-elevated text-brand font-mono text-xs flex items-center justify-center font-bold border border-surface-border">
                        {activeConversation.participantAvatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm text-brand">
                            {activeConversation.participantName}
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <span className="text-xs text-brand-muted font-mono">
                          {activeConversation.projectName || "Enterprise Rebrand"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                    {messages.map((msg) => {
                      const isMe = !msg.isCurrentUser;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-[10px] font-mono text-brand-muted">
                              {msg.senderName}
                            </span>
                            <span className="text-[10px] font-mono text-surface-border">•</span>
                            <span className="text-[10px] font-mono text-brand-muted">
                              {msg.timestamp}
                            </span>
                          </div>

                          <div
                            className={`max-w-md sm:max-w-lg rounded-xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-subtle ${
                              isMe
                                ? "bg-accent text-background font-medium rounded-tr-none"
                                : "bg-surface-elevated text-brand border border-surface-border rounded-tl-none font-light"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    onSubmit={handleSendMessage}
                    className="p-3 sm:p-4 border-t border-surface-border bg-surface flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder={`Reply to ${activeConversation.participantName}...`}
                      className="flex-1 bg-surface-elevated border border-surface-border rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-brand placeholder-brand-muted focus:outline-none focus:border-accent/40 font-light"
                    />
                    <Button type="submit" size="md" icon={<Send className="w-3.5 h-3.5" />}>
                      Send
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-brand-muted text-xs font-mono">
                  Select a discussion thread
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
