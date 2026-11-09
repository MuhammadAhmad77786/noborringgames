"use client";

import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/upload-client";

function Btn({ on, active, label, children, disabled }: { on: () => void; active?: boolean; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" className={active ? "is-active" : ""} onClick={on} title={label} aria-label={label} aria-pressed={active} disabled={disabled}>
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage, uploading, source, toggleSource }: { editor: Editor; onImage: () => void; uploading: boolean; source: boolean; toggleSource: () => void }) {
  const c = () => editor.chain().focus();
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", prev ?? "https://");
    if (url === null) return;
    if (!url.trim()) return c().extendMarkRange("link").unsetLink().run();
    const sponsored = /amazon\.|amzn\.|shareasale|awin|rakuten|impact/i.test(url);
    c().extendMarkRange("link").setLink({ href: url.trim(), rel: sponsored ? "sponsored noopener nofollow" : null } as never).run();
  };
  const addVideo = () => {
    const url = window.prompt("YouTube URL");
    if (url) editor.commands.setYoutubeVideo({ src: url });
  };
  const editAlt = () => {
    const current = editor.getAttributes("image").alt as string | undefined;
    const alt = window.prompt("Image alt text", current ?? "");
    if (alt !== null) c().updateAttributes("image", { alt }).run();
  };

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Formatting">
      <Btn label="Paragraph" on={() => c().setParagraph().run()} active={editor.isActive("paragraph")} disabled={source}>
        ¶
      </Btn>
      <Btn label="Heading 2" on={() => c().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} disabled={source}>
        H2
      </Btn>
      <Btn label="Heading 3" on={() => c().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} disabled={source}>
        H3
      </Btn>
      <span className="sep" />
      <Btn label="Bold" on={() => c().toggleBold().run()} active={editor.isActive("bold")} disabled={source}>
        <b>B</b>
      </Btn>
      <Btn label="Italic" on={() => c().toggleItalic().run()} active={editor.isActive("italic")} disabled={source}>
        <i>I</i>
      </Btn>
      <Btn label="Underline" on={() => c().toggleUnderline().run()} active={editor.isActive("underline")} disabled={source}>
        <u>U</u>
      </Btn>
      <Btn label="Link" on={setLink} active={editor.isActive("link")} disabled={source}>
        🔗 Link
      </Btn>
      <span className="sep" />
      <Btn label="Bullet list" on={() => c().toggleBulletList().run()} active={editor.isActive("bulletList")} disabled={source}>
        • List
      </Btn>
      <Btn label="Numbered list" on={() => c().toggleOrderedList().run()} active={editor.isActive("orderedList")} disabled={source}>
        1. List
      </Btn>
      <Btn label="Quote / tip" on={() => c().toggleBlockquote().run()} active={editor.isActive("blockquote")} disabled={source}>
        ❝ Tip
      </Btn>
      <Btn label="Divider" on={() => c().setHorizontalRule().run()} disabled={source}>
        ―
      </Btn>
      <span className="sep" />
      <Btn label="Insert image" on={onImage} disabled={uploading || source}>
        {uploading ? "Uploading…" : "🖼 Image"}
      </Btn>
      {editor.isActive("image") && (
        <Btn label="Edit alt text" on={editAlt}>
          Alt text
        </Btn>
      )}
      <Btn label="YouTube video" on={addVideo} disabled={source}>
        ▶ Video
      </Btn>
      <span className="sep" />
      <Btn label="Undo" on={() => c().undo().run()} disabled={source}>
        ↶
      </Btn>
      <Btn label="Redo" on={() => c().redo().run()} disabled={source}>
        ↷
      </Btn>
      <Btn label="Edit HTML" on={toggleSource} active={source}>
        {"</>"}
      </Btn>
    </div>
  );
}

/** `value` is the initial content; the editor owns the document after mount. */
export function RichEditor({ value, onChange, folder = "posts" }: { value: string; onChange: (html: string) => void; folder?: "posts" | "pages" }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [source, setSource] = useState(false);
  const [html, setHtml] = useState(value);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener" } },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ nocookie: true, modestBranding: true, width: 640, height: 360 }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const out = editor.getHTML();
      setHtml(out);
      onChange(out);
    },
  });

  async function onFile(file?: File) {
    if (!file || !editor) return;
    setUploading(true);
    try {
      const r = await uploadToCloudinary(file, folder);
      const alt = window.prompt("Describe this image (alt text) — required for accessibility & Pinterest:", "") ?? "";
      editor
        .chain()
        .focus()
        .setImage({ src: r.url, alt, ...(r.width ? { width: r.width, height: r.height } : {}) } as never)
        .run();
    } catch (e) {
      window.alert((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (!editor) return <div className="editor-wrap p-4 text-secondary">Loading editor…</div>;

  return (
    <div className="editor-wrap">
      <Toolbar
        editor={editor}
        uploading={uploading}
        onImage={() => fileRef.current?.click()}
        source={source}
        toggleSource={() => {
          if (source) editor.commands.setContent(html, { emitUpdate: true });
          setSource((s) => !s);
        }}
      />
      {source ? (
        <textarea
          className="form-control border-0 font-monospace"
          style={{ minHeight: 420, fontSize: 13 }}
          value={html}
          aria-label="HTML source"
          onChange={(e) => {
            setHtml(e.target.value);
            onChange(e.target.value);
          }}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}
