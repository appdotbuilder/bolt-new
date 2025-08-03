
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { PageEditor } from '@/components/PageEditor';
import { PageViewer } from '@/components/PageViewer';
import { PublishSuccessModal } from '@/components/PublishSuccessModal';
// Using type-only imports for better TypeScript compliance
import type { CreatePageInput, PageTheme, PublishedPageResponse, Page } from '../../server/src/schema';

function App() {
  // Form state for page creation/editing
  const [formData, setFormData] = useState<CreatePageInput>({
    title: '',
    content: '# Welcome to my page\n\nThis is some **bold** text and this is *italic* text.\n\n## Subsection\n\n- List item 1\n- List item 2\n- List item 3\n\nYou can add links like [this](https://example.com).',
    hero_image_url: null,
    theme: 'light'
  });

  // State for published page response
  const [publishedPage, setPublishedPage] = useState<PublishedPageResponse | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // State for editing existing page
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editSecret, setEditSecret] = useState<string | null>(null);

  // Theme options
  const themes: { value: PageTheme; label: string; description: string }[] = [
    { value: 'light', label: '☀️ Light', description: 'Clean and bright' },
    { value: 'dark', label: '🌙 Dark', description: 'Modern dark theme' },
    { value: 'mint', label: '🌿 Mint', description: 'Fresh and calming' },
    { value: 'corporate', label: '💼 Corporate', description: 'Professional look' },
    { value: 'modern', label: '✨ Modern', description: 'Contemporary style' }
  ];

  const loadPageForEditing = useCallback(async (secret: string) => {
    try {
      const page = await trpc.getPageByEditSecret.query({ edit_secret: secret });
      if (page) {
        setEditingPage(page);
        setFormData({
          title: page.title,
          content: page.content,
          hero_image_url: page.hero_image_url,
          theme: page.theme
        });
      } else {
        // STUB: Since the API returns null, we'll show a placeholder message
        console.warn('Edit page not found - using stub data');
      }
    } catch (error) {
      console.error('Failed to load page for editing:', error);
    }
  }, []);

  // Check for edit URL on component mount
  useEffect(() => {
    const path = window.location.pathname;
    const editMatch = path.match(/^\/edit\/(.+)$/);
    
    if (editMatch) {
      const secret = editMatch[1];
      setEditSecret(secret);
      loadPageForEditing(secret);
    }
  }, [loadPageForEditing]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      if (editingPage && editSecret) {
        // Update existing page
        const updatedPage = await trpc.updatePage.mutate({
          edit_secret: editSecret,
          title: formData.title,
          content: formData.content,
          hero_image_url: formData.hero_image_url,
          theme: formData.theme
        });
        setEditingPage(updatedPage);
        
        // Show success message for update
        setPublishedPage({
          id: updatedPage.id,
          public_url: `${window.location.origin}/${updatedPage.public_slug}`,
          edit_url: `${window.location.origin}/edit/${updatedPage.edit_secret}`,
          public_slug: updatedPage.public_slug,
          edit_secret: updatedPage.edit_secret
        });
      } else {
        // Create new page
        const response = await trpc.createPage.mutate(formData);
        setPublishedPage(response);
      }
      setShowPublishModal(true);
    } catch (error) {
      console.error('Failed to publish page:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleThemeChange = (theme: PageTheme) => {
    setFormData((prev: CreatePageInput) => ({ ...prev, theme }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // STUB: In a real implementation, this would upload to a file storage service
      // For now, we'll create a placeholder URL
      const placeholderUrl = `https://via.placeholder.com/800x400/4f46e5/ffffff?text=${encodeURIComponent(file.name)}`;
      setFormData((prev: CreatePageInput) => ({ 
        ...prev, 
        hero_image_url: placeholderUrl 
      }));
      console.log('STUB: File upload simulation - using placeholder image');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">bolt.new</h1>
            {editingPage && (
              <Badge variant="secondary" className="ml-2">
                Editing Mode
              </Badge>
            )}
          </div>

          {/* Theme Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 mr-2">Theme:</span>
            {themes.map((theme) => (
              <Button
                key={theme.value}
                variant={formData.theme === theme.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange(theme.value)}
                className="text-xs"
              >
                {theme.label}
              </Button>
            ))}
          </div>

          {/* Publish Button */}
          <Button 
            onClick={handlePublish} 
            disabled={isPublishing || !formData.title.trim()}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPublishing ? 'Publishing...' : editingPage ? 'Update Page' : 'Publish'}
          </Button>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="flex h-[calc(100vh-81px)]">
        {/* Left Pane - Editor */}
        <div className="w-1/2 bg-white border-r border-gray-200">
          <PageEditor
            formData={formData}
            setFormData={setFormData}
            onImageUpload={handleImageUpload}
          />
        </div>

        {/* Right Pane - Live Preview */}
        <div className="w-1/2 bg-gray-50">
          <PageViewer
            title={formData.title || 'Untitled Page'}
            content={formData.content}
            heroImageUrl={formData.hero_image_url ?? null}
            theme={formData.theme}
          />
        </div>
      </div>

      {/* Publish Success Modal */}
      <PublishSuccessModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        publishedPage={publishedPage}
        isUpdate={!!editingPage}
        onCopyToClipboard={copyToClipboard}
      />

      {/* Stub Data Warning */}
      <div className="fixed bottom-4 right-4">
        <Alert className="w-80 bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-xs text-yellow-800">
            <strong>Development Mode:</strong> Using stub data for page persistence and image uploads. 
            Published pages are not actually saved.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

export default App;
