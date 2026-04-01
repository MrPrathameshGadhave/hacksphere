import React, { useCallback, useState } from "react";
import Image from "next/image";
import { Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  currentImages?: string[];
  maxImages?: number;
  maxSizePerImage?: number; // in MB
  disabled?: boolean;
}

export function ImageUpload({
  onImagesChange,
  currentImages = [],
  maxImages = 5,
  maxSizePerImage = 5,
  disabled = false,
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(currentImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  const handleImageSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      if (files.length === 0) return;

      setError("");

      // Validate file count
      if (images.length + files.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`);
        return;
      }

      // Validate file sizes
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const maxTotalSize = maxImages * maxSizePerImage * 1024 * 1024;

      if (totalSize > maxTotalSize) {
        setError(`Total image size exceeds ${maxImages * maxSizePerImage}MB limit`);
        return;
      }

      for (const file of files) {
        if (
          file.size >
          maxSizePerImage * 1024 * 1024
        ) {
          setError(
            `Image "${file.name}" exceeds ${maxSizePerImage}MB limit`
          );
          return;
        }

        if (!file.type.startsWith("image/")) {
          setError(`"${file.name}" is not a valid image file`);
          return;
        }
      }

      setUploading(true);

      try {
        const uploadedImages: string[] = [];

        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

          const fileId = Math.random().toString(36);

          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              setUploadProgress((prev) => ({
                ...prev,
                [fileId]: percentComplete,
              }));
            }
          });

          const response = await new Promise<any>((resolve, reject) => {
            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
              } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            });

            xhr.addEventListener("error", () => {
              reject(new Error("Upload failed"));
            });

            xhr.open(
              "POST",
              `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`
            );

            xhr.send(formData);
          });

          uploadedImages.push(response.secure_url);
        }

        const newImages = [...images, ...uploadedImages];
        setImages(newImages);
        onImagesChange(newImages);
        setUploadProgress({});
      } catch (err) {
        setError(
          "Failed to upload images. Please check your internet connection and try again."
        );
        console.error("Image upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [images, maxImages, maxSizePerImage, onImagesChange]
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-[#202225] mb-2">
          Project Images (Screenshots, UI/UX, Architecture)
        </label>
        <p className="text-xs text-[#6B7280] mb-3">
          Upload up to {maxImages} images ({maxSizePerImage}MB max per image). High-quality
          screenshots help judges understand your project better.
        </p>

        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            disabled={uploading || images.length >= maxImages || disabled}
            className="hidden"
            id="image-upload"
          />

          <label
            htmlFor="image-upload"
            className={`block border-2 border-dashed rounded-[16px] p-6 text-center cursor-pointer transition-all duration-300 ${
              uploading || images.length >= maxImages || disabled
                ? "border-[#D1D5DB] bg-[#FCFCFD] cursornot-allowed opacity-50"
                : "border-[#A01C33]/20 bg-[#F8E9ED]/50 hover:border-[#A01C33] hover:bg-[#F8E9ED]"
            }`}
          >
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-[#A01C33]" />
              <div>
                <p className="text-sm font-semibold text-[#202225]">
                  {uploading
                    ? "Uploading images..."
                    : images.length >= maxImages
                      ? `Maximum ${maxImages} images reached`
                      : "Click to upload or drag and drop"}
                </p>
                {!uploading && images.length < maxImages && (
                  <p className="text-xs text-[#6B7280]">
                    PNG, JPG, GIF up to {maxSizePerImage}MB
                  </p>
                )}
              </div>
            </div>
          </label>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-[#202225] mb-3">
            Uploaded Images ({images.length}/{maxImages})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={index} className="group relative">
                <div className="relative h-24 w-full rounded-lg overflow-hidden border border-[#EEF2F7] bg-[#F9FAFB]">
                  <Image
                    src={image}
                    alt={`Uploaded image ${index + 1}`}
                    fill
                    className="object-cover"
                  />

                  {uploadProgress[index] ? (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-white text-xs font-semibold">
                          {Math.round(uploadProgress[index])}%
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            {images.length} image{images.length > 1 ? "s" : ""} uploaded successfully
          </p>
        </div>
      )}
    </div>
  );
}
