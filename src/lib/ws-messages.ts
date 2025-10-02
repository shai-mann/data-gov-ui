/* eslint-disable @typescript-eslint/no-explicit-any */
export enum WSMessageType {
  STATE_TRANSITION = "state_transition",
  SUB_STATE_LOG = "sub_state_log",
  CHAIN_START = "chain_start",
  CHAIN_END = "chain_end",
  TOOL_START = "tool_start",
  TOOL_END = "tool_end",
  ERROR = "error",
  INFO = "info",
}

export interface WSMessage {
  type: WSMessageType;
  timestamp: string;
  data: any;
}

export interface StateTransitionData {
  from: string;
  to: string;
  [key: string]: any;
}

export interface SubStateLogData {
  state: string;
  action: string;
  [key: string]: any;
}

export interface InfoData {
  message: string;
  [key: string]: any;
}

export interface ErrorData {
  error: string;
  stack?: string;
  context?: any;
}

export interface FormattedLog {
  id: string;
  timestamp: Date;
  content: string;
  type: WSMessageType;
  raw?: any;
}

/**
 * Parse and format WebSocket messages
 */
export function parseWSMessage(data: any): WSMessage | null {
  try {
    // Handle connection messages
    if (data.type === "connection") {
      return null; // Skip connection messages
    }

    // Validate message structure
    if (!data.type || !data.timestamp) {
      return null;
    }

    return data as WSMessage;
  } catch (error) {
    console.error("Failed to parse WebSocket message:", error);
    return null;
  }
}

/**
 * Format a WebSocket message for display
 */
export function formatWSMessage(message: WSMessage): FormattedLog {
  const timestamp = new Date(message.timestamp);
  const id = `${timestamp.getTime()}-${Math.random()}`;

  switch (message.type) {
    case WSMessageType.STATE_TRANSITION:
      const stateData = message.data as StateTransitionData;
      return {
        id,
        timestamp,
        content: `State: ${stateData.from} → ${stateData.to}`,
        type: message.type,
        raw: message.data,
      };

    case WSMessageType.SUB_STATE_LOG:
      const subStateData = message.data as SubStateLogData;
      return {
        id,
        timestamp,
        content: `${subStateData.action}`,
        type: message.type,
        raw: message.data,
      };

    case WSMessageType.INFO:
      const infoData = message.data as InfoData;
      return {
        id,
        timestamp,
        content: infoData.message,
        type: message.type,
        raw: message.data,
      };

    case WSMessageType.ERROR:
      const errorData = message.data as ErrorData;
      return {
        id,
        timestamp,
        content: `Error: ${errorData.error}`,
        type: message.type,
        raw: message.data,
      };

    case WSMessageType.CHAIN_START:
      return {
        id,
        timestamp,
        content: `Chain started: ${message.data.name || "unnamed"}`,
        type: message.type,
        raw: message.data,
      };

    case WSMessageType.CHAIN_END:
      return {
        id,
        timestamp,
        content: `Chain completed: ${message.data.name || "unnamed"}`,
        type: message.type,
        raw: message.data,
      };

    case WSMessageType.TOOL_START:
      return {
        id,
        timestamp,
        content: `Tool started: ${message.data.tool || "unknown"}`,
        type: message.type,
        raw: message.data,
      };

    case WSMessageType.TOOL_END:
      return {
        id,
        timestamp,
        content: `Tool completed: ${message.data.tool || "unknown"}`,
        type: message.type,
        raw: message.data,
      };

    default:
      return {
        id,
        timestamp,
        content: JSON.stringify(message.data),
        type: message.type,
        raw: message.data,
      };
  }
}
