import { View, Text, Image, useWindowDimensions } from "react-native";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { focusOn } from "@cloudinary/url-gen/qualifiers/gravity";
import { FocusOn } from "@cloudinary/url-gen/qualifiers/focusOn";
import { cld } from "~/src/lib/cloudinary";

type PostProps = {
  post: {
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
};

export default function PostListItem({ post }: PostProps) {
  const { width } = useWindowDimensions();

  // Handle missing user data
  const defaultAvatarUrl = "https://via.placeholder.com/48"; // Replace with your default avatar URL
  const avatarUrl = post.user?.avatar_url
    ? post.user.avatar_url
    : defaultAvatarUrl;
  const username = post.user?.username || "Unknown User";

  // Transform post image
  const image = cld.image(post.image);
  image.resize(thumbnail().width(width).height(width));

  // Transform avatar image
  const avatar = cld.image(avatarUrl);
  avatar.resize(
    thumbnail().width(48).height(48).gravity(focusOn(FocusOn.face()))
  );

  return (
    <View className="bg-white">
      {/* User Info */}
      <View className="p-3 flex-row items-center gap-2">
        <Image
          source={{ uri: avatar.toURL() }}
          className="w-12 aspect-square rounded-full"
        />
        <Text className="font-semibold">{username}</Text>
      </View>
      {/* Content */}
      <Image source={{ uri: image.toURL() }} className="w-full aspect-[4/3]" />
      {/* Caption */}
      <Text className="p-3">{post.caption || "No caption"}</Text>
      {/* Icons */}
      <View className="flex-row gap-3 p-3">
        <AntDesign name="hearto" size={20} color="black" />
        <Ionicons name="chatbubble-outline" size={20} color="black" />
        <Feather name="send" size={20} color="black" />
        <Feather name="bookmark" size={20} color="black" className="ml-auto" />
      </View>
    </View>
  );
}
