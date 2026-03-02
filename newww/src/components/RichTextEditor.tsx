import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '../lib/utils';
import { Button } from '../ui/button';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading2,
    Quote,
    Undo,
    Redo
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
                    className
                ),
            },
        },
    });

    if (!editor) {
        return null;
    }

    const MenuButton = ({
        onClick,
        active,
        children
    }: {
        onClick: () => void;
        active?: boolean;
        children: React.ReactNode
    }) => (
        <Button
            type="button"
            variant={active ? "secondary" : "ghost"}
            size="sm"
            onClick={onClick}
            className="h-8 w-8 p-0"
        >
            {children}
        </Button>
    );

    return (
        <div className="border rounded-lg overflow-hidden bg-background">
            <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                >
                    <Bold className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                >
                    <Italic className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                >
                    <Heading2 className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                >
                    <List className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                >
                    <ListOrdered className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                >
                    <Quote className="h-4 w-4" />
                </MenuButton>
                <div className="w-px bg-border mx-1" />
                <MenuButton onClick={() => editor.chain().focus().undo().run()}>
                    <Undo className="h-4 w-4" />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().redo().run()}>
                    <Redo className="h-4 w-4" />
                </MenuButton>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
