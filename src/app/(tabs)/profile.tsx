import { Text, View, Image, TextInput, FlatList, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import Button from "~/src/components/Button";
import { supabase } from "~/src/lib/supabase";
import { useAuth } from "~/src/app/Providers/AuthProvider";
import { uploadImage } from "~/src/lib/cloudinary";
import { cld } from "~/src/lib/cloudinary";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { focusOn } from "@cloudinary/url-gen/qualifiers/gravity";
import { FocusOn } from "@cloudinary/url-gen/qualifiers/focusOn";

type Post = {
  id: string;
  caption: string;
  image: string;
  user_id: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
};

export default function ProfileScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const { session } = useAuth();

  // Load user profile and posts on mount
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        Alert.alert("Error", "Failed to load profile.");
        return;
      }

      if (data) {
        setUsername(data.username || "");
        setImage(data.avatar_url ? cld.image(data.avatar_url).toURL() : null);
      }
    };

    const loadPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          id,
          caption,
          image,
          user_id,
          user:profiles (id, username, avatar_url)
        `
        )
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error loading posts:", error);
        Alert.alert("Error", "Failed to load posts.");
        return;
      }

      setPosts(data || []);
    };

    loadProfile();
    loadPosts();
  }, [session?.user?.id]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed: Use correct enum value
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const updateProfile = async () => {
    if (!session?.user?.id) {
      Alert.alert("Error", "You must be logged in to update your profile.");
      return;
    }

    try {
      let avatarPublicId = null;

      // Upload new avatar to Cloudinary if an image is selected
      if (image && !image.startsWith("https://")) {
        // Check if image is a local URI (not already a Cloudinary URL)
        const response = await uploadImage(image);
        if (!response?.secure_url) {
          console.error("Failed to upload avatar: No secure_url returned");
          Alert.alert("Error", "Failed to upload avatar. Please try again.");
          return;
        }
        avatarPublicId = response.public_id;
      }

      // Update profile in Supabase
      const { data, error } = await supabase
        .from("profiles")
        .upsert([
          {
            id: session.user.id,
            username: username || null,
            avatar_url:
              avatarPublicId || (image ? cld.image(image).toURL() : null),
          },
        ])
        .select();

      if (error) {
        console.error("Supabase upsert error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        Alert.alert("Error", `Failed to update profile: ${error.message}`);
        return;
      }

      console.log("Updated profile:", data);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      console.error("Unexpected error updating profile:", {
        message: error.message,
        stack: error.stack,
      });
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  // Render a single post
  const renderPost = ({ item }: { item: Post }) => {
    const defaultAvatarUrl = "https://via.placeholder.com/48";
    const avatarUrl = item.user?.avatar_url
      ? item.user.avatar_url
      : defaultAvatarUrl;
    const username = item.user?.username || "Unknown User";

    const postImage = cld.image(item.image);
    postImage.resize(thumbnail().width(200).height(200));

    const avatar = cld.image(avatarUrl);
    avatar.resize(
      thumbnail().width(48).height(48).gravity(focusOn(FocusOn.face()))
    );

    return (
      <View className="bg-white mb-3 p-3">
        <View className="flex-row items-center gap-2 mb-2">
          <Image
            source={{ uri: avatar.toURL() }}
            className="w-12 aspect-square rounded-full"
          />
          <Text className="font-semibold">{username}</Text>
        </View>
        <Image
          source={{ uri: postImage.toURL() }}
          className="w-full aspect-[4/3]"
        />
        <Text className="mt-2">{item.caption}</Text>
      </View>
    );
  };

  return (
    <View className="p-3 flex-1">
      {/* Avatar Image Picker */}
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
      {/* Form */}
      <Text className="mb-2 text-grey-500 font-semibold self-start">
        Username
      </Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        className="border border-grey-300 p-3 rounded-md boxshadow-sm w-full mb-3"
      />
      {/* User Posts */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        className="w-full mt-5"
        ListEmptyComponent={<Text>No posts yet.</Text>}
      />
      {/* Buttons */}
      <View className="gap-2 mt-auto w-full">
        <Button title="Update Profile" onPress={updateProfile} />
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}
