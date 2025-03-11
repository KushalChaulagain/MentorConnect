import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Log the environment variables for debugging
console.log("Cloudinary Environment Variables:");
console.log("CLOUD_NAME:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log("API_KEY:", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? "Present (not shown for security)" : "Missing");
console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "Present (not shown for security)" : "Missing");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    console.log("Starting image upload process...");
    
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log("User authenticated:", session.user.id);

    // Parse the request to get the base64 data
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }
    
    console.log("Image data received, length:", image.length);
    
    // Verify Cloudinary configuration
    console.log("Cloudinary config before upload:", {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key ? "Present" : "Missing",
      api_secret: cloudinary.config().api_secret ? "Present" : "Missing"
    });

    // Upload the image to Cloudinary
    console.log("Attempting to upload to Cloudinary...");
    const result = await cloudinary.uploader.upload(image, {
      folder: "mentorconnect/profiles",
      // Use the user ID as public_id to replace previous uploads for the same user
      public_id: `user-${session.user.id}`,
      overwrite: true,
      // Add transformation if needed (e.g., crop to square for profile pics)
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" }
      ]
    });
    
    console.log("Upload successful, URL:", result.secure_url);

    // Return the URL of the uploaded image
    return NextResponse.json({ 
      imageUrl: result.secure_url,
      publicId: result.public_id 
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image", details: (error as Error).message },
      { status: 500 }
    );
  }
} 