"use client";

import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolInvocationDisplayProps {
  toolName: string;
  args: {
    command?: string;
    path?: string;
    new_path?: string;
  };
  state: "partial-call" | "call" | "result";
  result?: unknown;
}

/**
 * Extracts the filename from a file path.
 * @param path - Full file path (e.g., "/src/components/App.jsx")
 * @returns Just the filename (e.g., "App.jsx")
 */
function getFilename(path: string | undefined): string {
  if (!path) return "file";
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

/**
 * Returns a human-readable message for a tool invocation.
 */
function getDisplayMessage(
  toolName: string,
  args: ToolInvocationDisplayProps["args"]
): string {
  const filename = getFilename(args.path);

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return `Creating ${filename}`;
      case "str_replace":
        return `Editing ${filename}`;
      case "insert":
        return `Editing ${filename}`;
      case "view":
        return `Viewing ${filename}`;
      case "undo_edit":
        return `Undoing changes to ${filename}`;
      default:
        return `Editing ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "delete":
        return `Deleting ${filename}`;
      case "rename":
        const newFilename = getFilename(args.new_path);
        return `Renaming ${filename} → ${newFilename}`;
      default:
        return `Managing ${filename}`;
    }
  }

  return `Running ${toolName}`;
}

export function ToolInvocationDisplay({
  toolName,
  args,
  state,
  result,
}: ToolInvocationDisplayProps) {
  const isComplete = state === "result" && result !== undefined;
  const message = getDisplayMessage(toolName, args);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg text-xs font-medium border",
        isComplete
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-neutral-50 border-neutral-200 text-neutral-700"
      )}
    >
      {isComplete ? (
        <Check className="w-3 h-3 text-emerald-600" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span>{message}</span>
    </div>
  );
}
