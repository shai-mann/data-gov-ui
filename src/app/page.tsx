"use client";

import { useState, useEffect, useRef, useLayoutEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import { SettingsDialog } from "@/components/settings-dialog";
import { LoadingConsole } from "@/components/loading-console";
import { WebSocketManager } from "@/lib/websocket";
import { research } from "@/lib/api";
import {
  parseWSMessage,
  formatWSMessage,
  WSMessageType,
  type FormattedLog,
} from "@/lib/ws-messages";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
}

interface StateSection {
  state: string;
  logs: FormattedLog[];
  isActive: boolean;
}

const LOCAL_STORAGE_KEY = "data-gov-server-url";

export default function Home() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [serverUrl, setServerUrl] = useState("");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [stateSections, setStateSections] = useState<StateSection[]>([]);
  const [resultContent, setResultContent] = useState<string>("");
  const wsManagerRef = useRef<WebSocketManager | null>(null);

  // Derive current state and logs from stateSections
  const currentState = useMemo(() => {
    const activeSection = stateSections.find((s) => s.isActive);
    return activeSection?.state || null;
  }, [stateSections]);

  const currentLogs = useMemo(() => {
    const activeSection = stateSections.find((s) => s.isActive);
    return activeSection?.logs || [];
  }, [stateSections]);

  const completedStateSections = useMemo(() => {
    return stateSections.filter((s) => !s.isActive);
  }, [stateSections]);

  // Initialize WebSocket manager
  useEffect(() => {
    wsManagerRef.current = new WebSocketManager();

    return () => {
      wsManagerRef.current?.disconnect();
    };
  }, []);

  // Load server URL from local storage on mount
  useLayoutEffect(() => {
    const savedUrl = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedUrl) {
      setServerUrl(savedUrl);
    }
  }, []);

  // WebSocket connection management
  useEffect(() => {
    if (!serverUrl || !wsManagerRef.current) return;

    // Connect to the server
    wsManagerRef.current.connect(serverUrl);

    // Subscribe to messages
    const unsubscribe = wsManagerRef.current.onMessage((data) => {
      if (data.connectionId) {
        setConnectionId(data.connectionId);
        return;
      }

      // Only process messages during querying
      if (!isQuerying) return;

      // Parse and format the message
      const message = parseWSMessage(data);
      if (!message) return;

      // Handle state transitions
      if (message.type === WSMessageType.STATE_TRANSITION) {
        const toState = message.data.to;

        setStateSections((prev) => {
          // Mark the current active section as inactive
          const updated = prev.map((section) =>
            section.isActive ? { ...section, isActive: false } : section
          );

          // Add the new state as active
          return [
            ...updated,
            {
              state: toState,
              logs: [],
              isActive: true,
            },
          ];
        });
        return;
      }

      // Add formatted log to the active state section
      const formattedLog = formatWSMessage(message);
      setStateSections((prev) =>
        prev.map((section) =>
          section.isActive
            ? { ...section, logs: [...section.logs, formattedLog] }
            : section
        )
      );
    });

    return () => {
      unsubscribe();
    };
  }, [serverUrl, isQuerying]);

  // Save server URL to local storage and update state
  const handleServerUrlChange = (url: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, url);
    setServerUrl(url);

    // Disconnect the websocket and re-create it
    wsManagerRef.current?.disconnect();
    wsManagerRef.current?.connect(url);
  };

  const handleSearch = async () => {
    if (!query.trim() || !serverUrl || !connectionId) {
      console.error("Missing required data:", {
        query: query.trim(),
        serverUrl,
        connectionId,
      });
      return;
    }

    // Clear previous result and state sections
    setResultContent("");
    setStateSections([]);
    setIsQuerying(true);

    try {
      const result = await research(serverUrl, {
        query: query.trim(),
        connectionId,
      });

      console.log("Research request successful", result);

      // Set the result content for markdown display
      if (result.result) {
        setResultContent(result.result);
      } else {
        setResultContent(JSON.stringify(result, null, 2));
      }

      // Add result to messages
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content:
            result.content ||
            result.result ||
            result.response ||
            JSON.stringify(result, null, 2),
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error calling /research endpoint:", error);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="h-screen bg-background">
      {/* Sticky Search Bar */}
      <div
        className={`sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b transition-all duration-200 ${
          isQuerying ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ask anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                disabled={isQuerying}
                className="pl-10 h-9 text-base shadow-sm"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isQuerying || !query.trim()}
              size="icon"
              className="h-9 w-auto px-6"
            >
              {isQuerying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching
                </>
              ) : (
                "Search"
              )}
            </Button>
            <div className="absolute right-4">
              <SettingsDialog
                serverUrl={serverUrl}
                onServerUrlChange={handleServerUrlChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {messages.length === 0 && !isQuerying ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-6">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-semibold mb-3 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
              What can I help you find?
            </h1>
            <p className="text-muted-foreground text-lg">
              Enter a search query to get started
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Loading Console - shows during querying */}
            {isQuerying && (
              <LoadingConsole
                currentState={currentState}
                logs={currentLogs}
                stateSections={completedStateSections}
              />
            )}

            {/* Results display - appears below loading console */}
            {messages.map((message) => (
              <div
                key={message.id}
                className="prose prose-neutral dark:prose-invert max-w-none
                          prose-headings:font-semibold prose-headings:tracking-tight
                          prose-h1:text-3xl prose-h1:mb-4
                          prose-p:leading-relaxed prose-p:text-foreground/90
                          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                          prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:text-foreground
                          prose-pre:bg-muted prose-pre:border prose-pre:shadow-sm prose-pre:text-foreground
                          prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:bg-muted/30 prose-blockquote:py-1
                          prose-ul:list-disc prose-ol:list-decimal
                          prose-li:marker:text-primary
                          animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <Markdown>{message.content}</Markdown>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
