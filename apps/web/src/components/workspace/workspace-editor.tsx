"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen, FileText, Trash2, ChevronRight, ChevronDown, Loader2, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { MarkdownEditor } from "./markdown-editor";

const AGENT_API = "/api/agent";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

function buildTree(paths: string[]): FileNode[] {
  const root: FileNode[] = [];
  for (const p of paths.sort()) {
    const parts = p.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      const fullPath = parts.slice(0, i + 1).join("/");
      let existing = current.find((n) => n.name === name);
      if (!existing) {
        existing = { name, path: fullPath, type: isFile ? "file" : "directory", children: isFile ? undefined : [] };
        current.push(existing);
      }
      if (!isFile) current = existing.children!;
    }
  }
  return root;
}

function FileTreeNode({
  node,
  depth,
  selectedPath,
  onSelect,
  onDelete,
}: {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  onDelete: (path: string) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  const isDir = node.type === "directory";
  const isSelected = node.path === selectedPath;
  const isHidden = node.name.startsWith(".") && node.name !== ".claude";

  if (isHidden && isDir && node.name !== ".claude") return null;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-0.5 px-1 rounded cursor-pointer text-xs group hover:bg-muted ${
          isSelected ? "bg-muted font-medium" : ""
        }`}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => {
          if (isDir) setOpen(!open);
          else onSelect(node.path);
        }}
      >
        {isDir ? (
          open ? <ChevronDown className="h-3 w-3 flex-shrink-0" /> : <ChevronRight className="h-3 w-3 flex-shrink-0" />
        ) : (
          <FileText className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
        )}
        <span className="truncate flex-1">{node.name}</span>
        {!isDir && (
          <Trash2
            className="h-3 w-3 text-muted-foreground hover:text-destructive hidden group-hover:block"
            onClick={(e) => { e.stopPropagation(); onDelete(node.path); }}
          />
        )}
      </div>
      {isDir && open && node.children?.map((child) => (
        <FileTreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          selectedPath={selectedPath}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export function WorkspaceEditor() {
  const { user } = useAuthStore();
  const userId = user?.id?.toString() || user?.email || "default";

  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadTree = useCallback(async () => {
    try {
      const resp = await fetch(`${AGENT_API}/workspace/tree?user_id=${userId}`);
      if (!resp.ok) return;
      const data = await resp.json();
      const files: string[] = Array.isArray(data.files) ? data.files : [];
      setTree(buildTree(files));
    } catch {}
  }, [userId]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const loadFile = useCallback(async (path: string) => {
    setIsLoading(true);
    setSelectedFile(path);
    try {
      const resp = await fetch(`${AGENT_API}/workspace/file?user_id=${userId}&path=${encodeURIComponent(path)}`);
      if (!resp.ok) throw new Error("Failed to load file");
      const data = await resp.json();
      setContent(data.content || "");
      setOriginalContent(data.content || "");
    } catch (e) {
      toast.error("Failed to load file");
      setContent("");
      setOriginalContent("");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isDirty = content !== originalContent;
  const isMarkdown = selectedFile?.endsWith(".md");

  return (
    <div className="flex h-full">
      {/* File tree sidebar */}
      <div className="w-56 border-r flex flex-col bg-muted/30">
        <div className="flex items-center justify-between px-2 py-2 border-b">
          <div className="flex items-center gap-1">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">Workspace</span>
          </div>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={loadTree}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {tree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              depth={0}
              selectedPath={selectedFile}
              onSelect={loadFile}
              onDelete={() => undefined}
            />
          ))}
        </div>

        <div className="border-t p-2 text-[11px] text-muted-foreground">
          Read-only workspace: the deployed Agent API exposes tree/file reads and Git sync, but not arbitrary file edits.
        </div>
      </div>

      {/* Editor pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedFile ? (
          <>
            {/* File header */}
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-mono truncate">{selectedFile}</span>
                {isDirty && <Badge variant="secondary" className="text-xs">Modified</Badge>}
              </div>
              <Badge variant="outline" className="text-xs">Read-only</Badge>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : isMarkdown ? (
                <MarkdownEditor content={content} readOnly />
              ) : (
                <textarea
                  value={content}
                  readOnly
                  className="w-full h-full p-4 font-mono text-sm bg-background resize-none focus:outline-none"
                  spellCheck={false}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <FolderOpen className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm">Select a file to inspect</p>
              <p className="text-xs mt-1">Workspace editing is pending an Agent API write contract.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
