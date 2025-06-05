import { TextInput, Text, View, Image, Pressable } from "react-native";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import Button from "~/src/components/Button";
import { uploadImage } from "~/src/lib/cloudinary";

export default function CreatePost() {
  const [caption, setCaption] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);

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
    }
  };

  const createPost = async () => {
    try {
      const uploadedImage = await uploadImage(image!);
      if (uploadedImage.secure_url) {
        console.log(
          "Post created successfully with image URL:",
          uploadedImage.secure_url
        );
        // Add logic to save the post with caption and uploadedImage.secure_url to your backend
        setCaption(""); // Reset caption
        setImage(null); // Reset image
      } else {
        console.log("Failed to create post: No image URL");
      }
    } catch (error) {
      console.error("Error creating post:", error);
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
