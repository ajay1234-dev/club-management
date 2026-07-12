import crypto from "crypto";

/**
 * Uploads a base64 image string to Cloudinary.
 * If Cloudinary environment variables are missing, falls back to a high-quality stock placeholder.
 */
export async function uploadPosterToCloudinary(base64Data: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary configuration missing. Using fallback placeholder.");

    // Return a random high-quality event stock photo from Unsplash
    const placeholders = [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800",
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        file: base64Data,
        api_key: apiKey,
        timestamp: timestamp,
        signature: signature,
      }).toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Cloudinary HTTP Error:", errText);
      throw new Error("Failed to upload image to Cloudinary.");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error in Cloudinary upload:", error);
    throw new Error("Cloudinary upload failed.");
  }
}
