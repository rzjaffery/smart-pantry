import {useRouter} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {Pressable, Text, View} from "react-native";

export default function PantryScreen(){
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className='flex-1 px-5 pt-8'>
                <Text className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                    SMART PANTRY
                </Text>
                <Text className="mt-2 text-3xl font-bold text-slate-900">
                    Your Pantry
                </Text>
                <Text className="mt-2 text-base leading-6 text-slate-500">
                    Your pantry items, search, filter, and sorting will live here
                </Text>

                <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/add-item')}
                    className='mt-6 items-center rounded-2xl bg-emerald-600 px-5 py-4'>
                    <Text className='font-bold text-white'>
                        + Add Items
                    </Text>
                </Pressable>

            </View>
        </SafeAreaView>

        )

}
