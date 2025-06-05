import { View, Text, Pressable } from "react-native";
type ButtonProps = {
  title: string;
  onPress?: () => void;
};

export default function Button({ title, onPress }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-blue-500 w-full p-3 rounded-lg items-center"
    >
      <Text className=" text-white font-semibold">{title}</Text>
    </Pressable>
  );
}
