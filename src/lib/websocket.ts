import {
  WebsocketBuilder,
  WebsocketEvent,
  ConstantBackoff,
  Websocket,
} from "websocket-ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MessageHandler = (data: any) => void;

const CONNECTION_ID_STORAGE_KEY = "ws-connection-id";

export class WebSocketManager {
  private ws: Websocket | null = null;
  private connectionId: string | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private serverUrl: string = "";
  private reconnectAttempts: number = 0;

  constructor(serverUrl?: string) {
    // Try to restore connection ID from localStorage
    this.loadConnectionId();

    if (serverUrl) {
      this.connect(serverUrl);
    }
  }

  private loadConnectionId() {
    try {
      const stored = localStorage.getItem(CONNECTION_ID_STORAGE_KEY);
      if (stored) {
        this.connectionId = stored;
        console.log("Restored connection ID from storage:", stored);
      }
    } catch (error) {
      console.warn("Failed to load connection ID from storage:", error);
    }
  }

  private saveConnectionId(id: string) {
    try {
      localStorage.setItem(CONNECTION_ID_STORAGE_KEY, id);
      console.log("Saved connection ID to storage:", id);
    } catch (error) {
      console.warn("Failed to save connection ID to storage:", error);
    }
  }

  connect(serverUrl: string) {
    // Close existing connection if any
    this.disconnect();

    this.serverUrl = serverUrl;
    let wsUrl = serverUrl
      .replace(/^https?:/, (match) => (match === "https:" ? "wss:" : "ws:"))
      .concat("/ws");

    // Add connectionId as query parameter if we have one
    if (this.connectionId) {
      wsUrl += `?connectionId=${encodeURIComponent(this.connectionId)}`;
      console.log("Reconnecting with connection ID:", this.connectionId);
    }

    // Build WebSocket with auto-reconnect
    this.ws = new WebsocketBuilder(wsUrl)
      .withBackoff(new ConstantBackoff(1000)) // Reconnect every 1 second
      .build();

    this.ws.addEventListener(WebsocketEvent.open, () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
    });

    this.ws.addEventListener(WebsocketEvent.message, (_ws, event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle connectionId assignment
        if (data.connectionId) {
          this.connectionId = data.connectionId;
          this.saveConnectionId(data.connectionId);
        }

        // Notify all handlers
        this.messageHandlers.forEach((handler) => handler(data));

        // Log all messages,  but only in development
        if (process.env.NODE_ENV === "development") {
          console.log("Message data:", data);
        }
      } catch {
        console.log("Non-JSON message:", event.data);
      }
    });

    this.ws.addEventListener(WebsocketEvent.error, (_ws, error: Event) => {
      console.error("WebSocket error:", error);
    });

    this.ws.addEventListener(WebsocketEvent.close, () => {
      console.log("WebSocket disconnected");
      this.reconnectAttempts++;

      // Don't clear connection ID on disconnect - we want to reuse it
      console.log(
        "Connection ID preserved for reconnection:",
        this.connectionId
      );
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    // Don't clear connection ID - preserve it for reconnection
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  getConnectionId(): string | null {
    return this.connectionId;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getServerUrl(): string {
    return this.serverUrl;
  }
}
