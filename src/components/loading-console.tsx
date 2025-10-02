"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { type FormattedLog } from "@/lib/ws-messages";

interface StateSection {
  state: string;
  logs: FormattedLog[];
  isActive: boolean;
}

interface LoadingConsoleProps {
  currentState: string | null;
  logs: FormattedLog[];
  stateSections: StateSection[];
}

export function LoadingConsole({
  currentState,
  logs,
  stateSections,
}: LoadingConsoleProps) {
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="space-y-4">
      {/* Render previous state sections as separate bordered accordions */}
      <AnimatePresence mode="popLayout">
        {stateSections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, height: "auto" }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Accordion
              type="single"
              collapsible
              className="border border-border rounded-lg bg-muted/30 font-mono text-sm"
            >
              <AccordionItem value={`state-${index}`} className="border-none">
                <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-foreground hover:no-underline">
                  {/* Splits camel case into spaces */}
                  {section.state.replace(/([a-z])([A-Z])/g, "$1 $2")}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-1">
                    {section.logs.length === 0 ? (
                      <div className="text-muted-foreground italic text-xs">
                        No logs for this state
                      </div>
                    ) : (
                      section.logs.map((log) => (
                        <div
                          key={log.id}
                          className="text-xs text-foreground/80 whitespace-pre-wrap break-words"
                        >
                          <span className="text-muted-foreground">
                            [{log.timestamp.toLocaleTimeString()}]
                          </span>{" "}
                          {log.content}
                        </div>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        ))}

        {/* Current active state - same bordered container style */}
        {currentState && (
          <motion.div
            key="active-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="border border-border rounded-lg bg-muted/30 p-4 font-mono text-sm"
          >
            {/* Current active state header */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-foreground font-semibold">
                {currentState.replace(/([a-z])([A-Z])/g, "$1 $2")}
              </span>
            </div>

            {/* Current active state logs */}
            {logs.length === 0 ? (
              <div className="text-muted-foreground italic text-xs">
                Thinking...
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-foreground/80 whitespace-pre-wrap break-words"
                  >
                    <span className="text-muted-foreground">
                      [{log.timestamp.toLocaleTimeString()}]
                    </span>{" "}
                    {log.content}
                  </motion.div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
