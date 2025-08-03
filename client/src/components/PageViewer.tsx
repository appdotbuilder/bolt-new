
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import type { PageTheme } from '../../../server/src/schema';

interface PageViewerProps {
  title: string;
  content: string;
  heroImageUrl: string | null;
  theme: PageTheme;
}

export function PageViewer({ title, content, heroImageUrl, theme }: PageViewerProps) {
  // Simple markdown to HTML conversion (basic implementation)
  const renderMarkdown = (markdown: string): string => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      // List items
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      // Wrap lists
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      // Wrap paragraphs
      .replace(/^(?!<[h1-6]|<ul|<li)(.+)$/gm, '<p>$1</p>')
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, '');
  };

  // Theme-specific styles
  const getThemeStyles = (theme: PageTheme) => {
    const themes = {
      light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        accent: 'text-blue-600',
        border: 'border-gray-200'
      },
      dark: {
        bg: 'bg-gray-900',
        text: 'text-gray-100',
        accent: 'text-blue-400',
        border: 'border-gray-700'
      },
      mint: {
        bg: 'bg-green-50',
        text: 'text-green-900',
        accent: 'text-green-700',
        border: 'border-green-200'
      },
      corporate: {
        bg: 'bg-slate-50',
        text: 'text-slate-900',
        accent: 'text-slate-700',
        border: 'border-slate-300'
      },
      modern: {
        bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
        text: 'text-gray-900',
        accent: 'text-purple-700',
        border: 'border-purple-200'
      }
    };
    return themes[theme];
  };

  const themeStyles = getThemeStyles(theme);

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-medium text-gray-700">Live Preview</h2>
          <Badge variant="outline" className="text-xs">
            {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme
          </Badge>
        </div>
      </div>

      {/* Preview Content */}
      <div className={`flex-1 overflow-auto ${themeStyles.bg}`}>
        <div className="max-w-4xl mx-auto">
          {/* Hero Image */}
          {heroImageUrl && (
            <div className="w-full h-64 overflow-hidden">
              <img 
                src={heroImageUrl} 
                alt="Hero" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Title */}
            <h1 className={`text-4xl font-bold mb-8 ${themeStyles.text}`}>
              {title}
            </h1>

            {/* Body Content */}
            <div 
              className={`prose prose-lg max-w-none ${themeStyles.text}`}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              style={{
                // Custom styles for markdown elements
                fontSize: '1.1rem',
                lineHeight: '1.7'
              }}
            />
          </div>
        </div>
      </div>

      {/* Preview Footer */}
      <div className={`p-4 ${themeStyles.bg} border-t ${themeStyles.border}`}>
        <div className="text-center">
          <p className={`text-xs ${themeStyles.text} opacity-60`}>
            Created with bolt.new ⚡
          </p>
        </div>
      </div>
    </div>
  );
}
