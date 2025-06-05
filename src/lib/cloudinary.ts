import { Cloudinary } from "@cloudinary/url-gen";

// Define a basic interface for Cloudinary's Upload API response
interface UploadApiResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any; // For other potential fields
}

export const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
  url: {
    secure: true, // Use HTTPS for URLs
  },
});

export const uploadImage = (image: string): Promise<UploadApiResponse> => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    if (!image) {
      console.log("No image selected");
      reject(new Error("No image selected"));
      return;
    }

    fetch(image)
      .then((response) => response.blob())
      .then((blob) => {
        const formData = new FormData();
        formData.append("file", blob, "upload.jpg");
        formData.append("upload_preset", "Default"); // Replace with your upload preset
        formData.append("cloud_name", cld.cloudinaryConfig.cloud.cloudName || "dnoitugnb"); // Use cloudName from cld, fallback to default

        return fetch(`https://api.cloudinary.com/v1_1/${cld.cloudinaryConfig.cloud.cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });
      })
      .then((uploadResponse) => uploadResponse.json())
      .then((result: UploadApiResponse) => {
        if (result.secure_url) {
          console.log("Upload success, public_id:", result.public_id);
          resolve(result);
        } else {
          console.error("Upload failed:", result);
          reject(new Error("Upload failed"));
        }
      })
      .catch((error) => {
        console.error("Upload error:", error);
        reject(error);
      });
  });
};