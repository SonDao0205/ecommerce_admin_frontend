"use client";

import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}

export function RichTextEditor({ value, onChange, disabled }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({ link: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return <div className="h-48 animate-pulse rounded-xl border bg-muted" />;
  const currentEditor = editor;

  const tools = [
    { label: "In đậm", icon: Bold, active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "In nghiêng", icon: Italic, active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Gạch chân", icon: UnderlineIcon, active: editor.isActive("underline"), run: () => editor.chain().focus().toggleUnderline().run() },
    { label: "Gạch ngang", icon: Strikethrough, active: editor.isActive("strike"), run: () => editor.chain().focus().toggleStrike().run() },
    { label: "Danh sách", icon: List, active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Danh sách số", icon: ListOrdered, active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Trích dẫn", icon: Quote, active: editor.isActive("blockquote"), run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Căn trái", icon: AlignLeft, active: editor.isActive({ textAlign: "left" }), run: () => editor.chain().focus().setTextAlign("left").run() },
    { label: "Căn giữa", icon: AlignCenter, active: editor.isActive({ textAlign: "center" }), run: () => editor.chain().focus().setTextAlign("center").run() },
    { label: "Căn phải", icon: AlignRight, active: editor.isActive({ textAlign: "right" }), run: () => editor.chain().focus().setTextAlign("right").run() },
  ];

  function editLink() {
    const previous = currentEditor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Nhập đường dẫn liên kết", previous ?? "https://");
    if (href === null) return;
    if (!href.trim()) currentEditor.chain().focus().unsetLink().run();
    else currentEditor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-background", disabled && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2">
        <select
          aria-label="Kiểu đoạn văn"
          disabled={disabled}
          className="h-8 cursor-pointer rounded-md border bg-background px-2 text-xs"
          value={editor.isActive("heading", { level: 1 }) ? "h1" : editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : "p"}
          onChange={(event) => {
            const type = event.target.value;
            if (type === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(type[1]) as 1 | 2 | 3 }).run();
          }}
        >
          <option value="p">Đoạn văn</option>
          <option value="h1">Tiêu đề 1</option>
          <option value="h2">Tiêu đề 2</option>
          <option value="h3">Tiêu đề 3</option>
        </select>
        {tools.map((tool) => (
          <Button key={tool.label} type="button" size="icon-sm" variant={tool.active ? "secondary" : "ghost"} title={tool.label} disabled={disabled} onClick={tool.run}>
            <tool.icon className="size-4" />
          </Button>
        ))}
        <Button type="button" size="icon-sm" variant={editor.isActive("link") ? "secondary" : "ghost"} title="Thêm liên kết" disabled={disabled} onClick={editLink}>
          <Link2 className="size-4" />
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button type="button" size="icon-sm" variant="ghost" title="Hoàn tác" disabled={disabled || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="size-4" />
        </Button>
        <Button type="button" size="icon-sm" variant="ghost" title="Làm lại" disabled={disabled || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="size-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="[&_.ProseMirror]:min-h-48 [&_.ProseMirror]:p-4 [&_.ProseMirror]:outline-none [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_ul]:ml-6 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ol]:ml-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline"
      />
    </div>
  );
}
