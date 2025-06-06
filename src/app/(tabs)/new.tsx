import { TextInput, Text, View, Image, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import Button from "~/src/components/Button";
import { uploadImage } from "~/src/lib/cloudinary";
import { supabase } from "~/src/lib/supabase";
import { useAuth } from "~/src/app/Providers/AuthProvider";
import { router } from "expo-router";

export default function CreatePost() {
  const [caption, setCaption] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    // Only trigger pickImage if image is null on component mount
    if (!image) {
      pickImage();
    }
  }, []); // Empty dependency array to run only on mount

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const createPost = async () => {
    // Validate authentication
    if (!session?.user?.id) {
      console.error("No authenticated user found:", session);
      Alert.alert("Error", "You must be logged in to create a post.");
      return;
    }

    // Validate image
    if (!image) {
      console.error("No image selected");
      Alert.alert("Error", "Please select an image to post.");
      return;
    }

    try {
      // Upload image to Cloudinary
      const response = await uploadImage(image);
      if (!response?.secure_url) {
        console.error("Failed to upload image: No secure_url returned");
        Alert.alert("Error", "Failed to upload image. Please try again.");
        return;
      }

      console.log("image id: ", response?.public_id);

      // Save the post in database
      const { data, error } = await supabase
        .from("posts")
        .insert([
          {
            caption: caption || null, // Allow empty captions
            image: response?.public_id,
            user_id: session?.user.id,
          },
        ])
        .select();

      if (error) {
        console.error("Supabase insert error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        Alert.alert("Error", `Failed to create post: ${error.message}`);
        return;
      }

      console.log("Inserted post:", data);
      setCaption(""); // Reset caption
      setImage(null); // Reset image
      router.push("/(tabs)"); // Navigate to home on success
    } catch (error: any) {
      console.error("Unexpected error creating post:", {
        message: error.message,
        stack: error.stack,
      });
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <View className="p-3 items-center flex-1">
      {/* Image Picker */}
      {image ? (
        <Image
          source={{ uri: image }}
          className="w-52 aspect-[3/4] rounded-lg bg-slate-300"
        />
      ) : (
        <View className="w-52 aspect-[3/4] rounded-lg bg-slate-300" />
      )}
      {/* Button to change image */}
      <Pressable onPress={pickImage}>
        <Text className="text-blue-500 font-semibold m-5">Change Image</Text>
      </Pressable>

      {/* Text input for caption */}
      <TextInput
        placeholder="What's on your mind?"
        className="w-full p-3 border border-gray-300 rounded-lg"
        value={caption}
        onChangeText={(newValue) => setCaption(newValue)}
        autoFocus
      />

      {/* Button to submit post */}
      <View className="mt-auto w-full">
        <Button title="Share" onPress={createPost} />
      </View>
    </View>
  );
}
