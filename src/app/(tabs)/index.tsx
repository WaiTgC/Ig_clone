import { useEffect, useState } from "react";
import { Alert, FlatList } from "react-native";
import PostListItem from "~/src/components/PostListItem";
import { supabase } from "~/src/lib/supabase";

export default function FeedScreen() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase.from("posts").select(`
        id,
        caption,
        image,
        user_id,
        user:profiles (id, username, avatar_url)
      `);

    if (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Failed to fetch posts. Please try again later.");
      return;
    }

    console.log("Fetched posts:", data);
    setPosts(data || []);
  };

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostListItem post={item} />}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        gap: 10,
        maxWidth: 512,
        width: "100%",
        alignSelf: "center",
      }}
    />
  );
}
