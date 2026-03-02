import { X } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';

interface ImageUploadFieldProps {
    title: string;
    description: string;
    image: string;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    aspectRatio: string;
    previewAspectRatio: string;
    previewMaxWidth?: string;
}

export function ImageUploadField({
    title,
    description,
    image,
    onImageUpload,
    onRemoveImage,
    inputRef,
    aspectRatio,
    previewAspectRatio,
    previewMaxWidth = "w-full max-w-sm"
}: ImageUploadFieldProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        onChange={onImageUpload}
                    />
                    <p className="text-xs text-muted-foreground">Required aspect ratio: {aspectRatio}</p>
                    {image && (
                        <div className={`relative ${previewAspectRatio} ${previewMaxWidth} overflow-hidden rounded-lg border`}>
                            <div className="group relative h-full w-full">
                                <img
                                    src={image}
                                    alt={`${title} preview`}
                                    className="h-full w-full object-cover"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={onRemoveImage}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
