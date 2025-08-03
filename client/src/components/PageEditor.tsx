
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X } from 'lucide-react';
import type { CreatePageInput } from '../../../server/src/schema';

interface PageEditorProps {
  formData: CreatePageInput;
  setFormData: React.Dispatch<React.SetStateAction<CreatePageInput>>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PageEditor({ formData, setFormData, onImageUpload }: PageEditorProps) {
  const handleRemoveImage = () => {
    setFormData((prev: CreatePageInput) => ({ ...prev, hero_image_url: null }));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">✍️ Page Editor</h2>
        
        {/* Page Title */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            Page Title
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreatePageInput) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter your page title..."
            className="text-lg font-medium"
            maxLength={200}
          />
          <div className="text-xs text-gray-500">
            {formData.title.length}/200 characters
          </div>
        </div>

        {/* Hero Image Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Hero Image or Logo
          </Label>
          
          {formData.hero_image_url ? (
            <Card className="relative">
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={formData.hero_image_url} 
                      alt="Hero" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Image uploaded</p>
                    <p className="text-xs text-gray-500 break-all">
                      {formData.hero_image_url}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Stub: Placeholder image
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors cursor-pointer">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">
                    Upload an image
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Markdown Editor */}
      <div className="flex-1 p-6">
        <div className="space-y-2 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <Label htmlFor="content" className="text-sm font-medium text-gray-700">
              Body Content (Markdown)
            </Label>
            <Badge variant="outline" className="text-xs">
              Markdown Supported
            </Badge>
          </div>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData((prev: CreatePageInput) => ({ ...prev, content: e.target.value }))
            }
            placeholder="Write your content using Markdown..."
            className="flex-1 resize-none font-mono text-sm"
            maxLength={50000}
          />
          <div className="text-xs text-gray-500">
            {formData.content.length}/50,000 characters
          </div>
        </div>
      </div>

      {/* Markdown Help */}
      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-900 mb-2">📝 Markdown Quick Reference</h3>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <p><code># Heading 1</code></p>
            <p><code>## Heading 2</code></p>
            <p><code>**bold text**</code></p>
            <p><code>*italic text*</code></p>
          </div>
          <div>
            <p><code>[link](url)</code></p>
            <p><code>- List item</code></p>
            <p><code>![image](url)</code></p>
            <p><code>`inline code`</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
