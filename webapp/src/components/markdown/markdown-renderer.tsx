'use client';

import ReactMarkdown from 'react-markdown';

export function MarkdownRenderer({ markdown }: { markdown: string }) {
    return (
        <ReactMarkdown>
            { markdown }
        </ReactMarkdown>
    );
}
