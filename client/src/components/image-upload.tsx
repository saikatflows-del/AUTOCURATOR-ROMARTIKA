import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: string;
  onChange: (base64: string | undefined) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(value);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        // The API might expect just the base64 data without the prefix, 
        // but for displaying we need the prefix.
        // We'll pass the full string and let the hook/api handle stripping if needed
        onChange(base64String);
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    disabled,
  });

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(undefined);
    onChange(undefined);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ease-in-out group",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted hover:border-primary/50 hover:bg-secondary/50",
          disabled && "opacity-50 cursor-not-allowed",
          preview ? "border-none p-0 overflow-hidden" : "p-6"
        )}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain bg-black/40"
            />
            {!disabled && (
              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full shadow-lg"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-secondary group-hover:bg-background transition-colors">
              {isDragActive ? (
                <ImageIcon className="h-8 w-8 text-primary animate-bounce" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? "Drop the image here" : "Click or drag image to upload"}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG, WEBP (max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
