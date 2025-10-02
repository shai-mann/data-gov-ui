import {
  WebsocketBuilder,
  WebsocketEvent,
  ConstantBackoff,
  Websocket,
} from "websocket-ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MessageHandler = (data: any) => void;

export class WebSocketManager {
  private ws: Websocket | null = null;
  private connectionId: string | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private serverUrl: string = "";

  constructor(serverUrl?: string) {
    if (serverUrl) {
      this.connect(serverUrl);
    }
  }

  connect(serverUrl: string) {
    // Close existing connection if any
    this.disconnect();

    this.serverUrl = serverUrl;
    const wsUrl = serverUrl.replace(/^https:/, "wss:").concat("/ws");

    // Build WebSocket with auto-reconnect
    this.ws = new WebsocketBuilder(wsUrl)
      .withBackoff(new ConstantBackoff(1000)) // Reconnect every 1 second
      .build();

    this.ws.addEventListener(WebsocketEvent.open, () => {
      console.log("WebSocket connected");
    });

    this.ws.addEventListener(WebsocketEvent.message, (_ws, event) => {
      console.log("WebSocket message received:", event.data);

      try {
        const data = JSON.parse(event.data);

        // Handle connectionId assignment
        if (data.connectionId) {
          this.connectionId = data.connectionId;
          console.log("Connection ID received:", data.connectionId);
        }

        // Notify all handlers
        this.messageHandlers.forEach((handler) => handler(data));

        // Log all messages
        console.log("Message data:", data);
      } catch (error) {
        console.log("Non-JSON message:", event.data);
      }
    });

    this.ws.addEventListener(WebsocketEvent.error, (_ws, error: Event) => {
      console.error("WebSocket error:", error);
    });

    this.ws.addEventListener(WebsocketEvent.close, () => {
      console.log("WebSocket disconnected");
      this.connectionId = null;
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionId = null;
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
