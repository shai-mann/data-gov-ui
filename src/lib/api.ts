interface ResearchRequest {
  query: string;
  connectionId: string;
}

interface ResearchResponse {
  content?: string;
  result?: string;
  response?: string;
  [key: string]: unknown;
}

export async function research(
  serverUrl: string,
  request: ResearchRequest
): Promise<ResearchResponse> {
  const response = await fetch(`${serverUrl}/research`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Research request failed: ${response.statusText}`);
  }

  return response.json();
}
