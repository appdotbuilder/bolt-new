
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { PublishedPageResponse } from '../../../server/src/schema';

interface PublishSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  publishedPage: PublishedPageResponse | null;
  isUpdate: boolean;
  onCopyToClipboard: (text: string) => Promise<void>;
}

export function PublishSuccessModal({ 
  isOpen, 
  onClose, 
  publishedPage, 
  isUpdate,
  onCopyToClipboard 
}: PublishSuccessModalProps) {
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedEdit, setCopiedEdit] = useState(false);

  const handleCopyPublic = async () => {
    if (publishedPage?.public_url) {
      await onCopyToClipboard(publishedPage.public_url);
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2000);
    }
  };

  const handleCopyEdit = async () => {
    if (publishedPage?.edit_url) {
      await onCopyToClipboard(publishedPage.edit_url);
      setCopiedEdit(true);
      setTimeout(() => setCopiedEdit(false), 2000);
    }
  };

  const handleViewLive = () => {
    if (publishedPage?.public_url) {
      window.open(publishedPage.public_url, '_blank');
    }
  };

  if (!publishedPage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>
              {isUpdate ? 'Page Updated Successfully!' : 'Page Published Successfully!'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              🎉 Your page is now live and ready to share! 
              {isUpdate ? ' Your changes have been saved.' : ''}
            </p>
          </div>

          {/* Public URL */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              📢 Public URL (Share this link)
            </Label>
            <div className="flex space-x-2">
              <Input
                value={publishedPage.public_url}
                readOnly
                className="flex-1 bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPublic}
                className="flex items-center space-x-1"
              >
                {copiedPublic ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedPublic ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Anyone with this link can view your page
            </p>
          </div>

          {/* Edit URL */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              🔐 Secret Edit URL (Save this link!)
            </Label>
            <div className="flex space-x-2">
              <Input
                value={publishedPage.edit_url}
                readOnly
                className="flex-1 bg-yellow-50 border-yellow-200"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyEdit}
                className="flex items-center space-x-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                {copiedEdit ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedEdit ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>

            {/* Warning Alert */}
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Important:</strong> Save this edit link! It's the only way to modify your page later. 
                We don't store user accounts, so if you lose this link, you won't be able to edit your page.
              </AlertDescription>
            </Alert>
          </div>

          {/* Stub Data Notice */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800 text-sm">
              <strong>Development Mode:</strong> This is using stub data. In production, these URLs would be real 
              and your page would be permanently accessible.
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  Page ID: {publishedPage.id}
                </Badge>
                <Badge variant="secondary" className="text-xs ml-1">
                  Slug: {publishedPage.public_slug}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleViewLive} className="flex items-center space-x-1">
            <ExternalLink className="w-4 h-4" />
            <span>View Live Page</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
