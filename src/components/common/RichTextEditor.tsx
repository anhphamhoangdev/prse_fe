import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    name: string;
    id: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
                                                                  value,
                                                                  onChange,
                                                                  error,
                                                                  name,
                                                                  id
                                                              }) => {
    return (
        <div className="space-y-1">
            <div className={`border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg overflow-hidden`}>
                <Editor
                    apiKey="azfuomud4597f85ezsky1duwjdmtrdv1zh9wota7rgx05thd"
                    value={value}
                    init={{
                        height: 500,
                        menubar: true,
                        plugins: [
                            'autolink', 'link', 'image', 'charmap',
                            'preview', 'searchreplace', 'visualblocks', 'code', 'codesample',
                            'insertdatetime', 'table', 'wordcount', 'media', 'help', 'style'
                        ],
                        toolbar: 'formatselect styleselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | codesample table link | removeformat | undo redo',

                        auto_list: false,
                        paste_as_text: true,
                        convert_urls: false,
                        autolink: false,
                        autolink_pattern: '',

                        block_formats: 'Paragraph=p;Heading 1=h1;Heading 2=h2;Heading 3=h3;Heading 4=h4',

                        color_map: [
                            "2563eb", "Blue 600",
                            "1d4ed8", "Blue 700",
                            "3b82f6", "Blue 500",
                            "111827", "Đen",
                            "374151", "Xám đậm",
                            "6b7280", "Xám",
                            "dc2626", "Đỏ",
                            "059669", "Xanh lục",
                            "7c3aed", "Tím"
                        ],

                        content_style: `
                        /* Base styles to match Tailwind prose */
                        body {
                            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                            font-size: 1.125rem;
                            line-height: 1.75;
                            max-width: none;
                            color: #374151;
                        }
                        
                        /* Headings */
                        h1 {
                            font-size: 2.25rem;
                            font-weight: 800;
                            line-height: 1.1111111;
                            margin-top: 2em;
                            margin-bottom: 0.8888889em;
                            color: #111827;
                        }
                        
                        h2 {
                            font-size: 1.875rem;
                            font-weight: 700;
                            line-height: 1.3333333;
                            margin-top: 2em;
                            margin-bottom: 1em;
                            color: #111827;
                        }
                        
                        h3 {
                            font-size: 1.5rem;
                            font-weight: 600;
                            line-height: 1.6;
                            margin-top: 1.6em;
                            margin-bottom: 0.6em;
                            color: #111827;
                        }
                        
                        h4 {
                            font-size: 1.25rem;
                            font-weight: 600;
                            line-height: 1.5;
                            margin-top: 1.5em;
                            margin-bottom: 0.5em;
                            color: #111827;
                        }
                        
                        /* Paragraph */
                        p {
                            margin-top: 1.25em;
                            margin-bottom: 1.25em;
                        }
                        
                        /* Links */
                        a {
                            color: #2563eb;
                            text-decoration: underline;
                            font-weight: 500;
                        }
                        
                        /* Images */
                        img {
                            margin-top: 2em;
                            margin-bottom: 2em;
                            border-radius: 0.375rem;
                        }
                        
                        /* Lists */
                        ul, ol {
                            margin-top: 1.25em;
                            margin-bottom: 1.25em;
                            padding-left: 1.625em;
                        }
                        
                        li {
                            margin-top: 0.5em;
                            margin-bottom: 0.5em;
                        }
                        
                        /* Blockquotes */
                        blockquote {
                            font-weight: 500;
                            font-style: italic;
                            color: #111827;
                            border-left-width: 0.25rem;
                            border-left-color: #e5e7eb;
                            margin-top: 1.6em;
                            margin-bottom: 1.6em;
                            padding-left: 1em;
                        }
                        
                        /* Code */
                        code {
                            color: #111827;
                            font-weight: 600;
                            font-size: 0.875em;
                        }
                        
                        pre {
                            color: #e5e7eb;
                            background-color: #1f2937;
                            overflow-x: auto;
                            font-size: 0.875em;
                            line-height: 1.7142857;
                            margin-top: 1.7142857em;
                            margin-bottom: 1.7142857em;
                            border-radius: 0.375rem;
                            padding: 0.8571429em 1.1428571em;
                        }
                    `,

                        skin: 'oxide',
                        statusbar: true,
                        branding: false,
                        paste_data_images: true,
                        browser_spellcheck: true,
                        contextmenu: 'link image table',
                        forced_root_block: 'p',

                        setup: function(editor) {
                            editor.on('BeforeSetContent', function(e) {
                                if (e.content.match(/^\d+\./)) {
                                    e.preventDefault();
                                }
                            });
                        }
                    }}
                    onEditorChange={(content) => {
                        onChange(content);
                    }}
                />
            </div>
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};