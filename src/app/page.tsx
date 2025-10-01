'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsQuerying(true);

    // Mock: simulate adding messages over time
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `# Search Results for: "${query}"\n\nThis is a **mock response** with some markdown content:\n\n- First result item\n- Second result item\n- Third result item\n\n\`\`\`javascript\nconst example = "code block";\nconsole.log(example);\n\`\`\`\n\n> This is a blockquote example\n\nMore content will appear here when connected to a websocket.`,
        timestamp: new Date()
      }]);
      setIsQuerying(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Search Bar */}
      <div className={`sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b transition-all duration-200 ${isQuerying ? 'pointer-events-none opacity-60' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ask anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isQuerying}
                className="pl-10 h-12 text-base shadow-sm"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isQuerying || !query.trim()}
              size="lg"
              className="h-12 px-6"
            >
              {isQuerying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {messages.length === 0 ? (
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
            {messages.map((message) => (
              <div
                key={message.id}
                className="prose prose-neutral dark:prose-invert max-w-none
                          prose-headings:font-semibold prose-headings:tracking-tight
                          prose-h1:text-3xl prose-h1:mb-4
                          prose-p:leading-relaxed prose-p:text-foreground/90
                          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                          prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                          prose-pre:bg-muted prose-pre:border prose-pre:shadow-sm
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
