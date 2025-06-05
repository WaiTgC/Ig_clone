import { Text, View, Image, TextInput } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import Button from "~/src/components/Button";
import { supabase } from "~/src/lib/supabase";
export default function ProfileScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [username, setUsername] = useState("");

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
      {/* {Avater Image Picker} */}
      {image ? (
        <Image
          source={{ uri: image }}
          className="w-52 aspect-square self-center rounded-full bg-slate-300"
        />
      ) : (
        <View className="w-52 aspect-square self-center rounded-full bg-slate-300" />
      )}
      <Text onPress={pickImage} className="text-blue-500 font-semibold m-5">
        Change
      </Text>
      {/* {Form} */}
      <Text className="mb-2 text-grey-500 font-semibold self-start ">
        Username
      </Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        className="border border-grey-300 p-3 rounded-md boxshadow-sm w-full mb-3"
      />
      {/* <TextInput
        placeholder="email"
        className="border border-grey-300 p-3 rounded-md boxshadow-sm "
      />
      <TextInput
        placeholder="bio"
        className="border-2 p-2 w-11/12 mt-3"
        multiline
      /> */}
      {/* {Button} */}
      <View className="gap-2 mt-auto w-full">
        <Button title="Update Profile" />
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}
