import { TextInput, Text, View, Image, Pressable } from "react-native";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function CreatePost() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      pickImage();
    }
  }, [image]);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
      <Text onPress={pickImage} className="text-blue-500 font-semibold m-5">
        Change
      </Text>
      
      {/* {text input for caption} */}
      <TextInput
        placeholder="What's on your mind?"
        className="w-full p-3 outline-black "
        value={caption}
        onChangeText={(newValue) => setCaption(newValue)}
        autoFocus
      />
      {/* Button to submit post */}
      <View className="mt-auto w-full">
        <Pressable className="bg-blue-500 w-full p-3 rounded-lg items-center">
          <Text className=" text-white font-semibold">Share</Text>
        </Pressable>
      </View>
    </View>
  );
}
