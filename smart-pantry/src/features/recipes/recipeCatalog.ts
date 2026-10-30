
import type {
    LocalRecipe,
    RecipeIngredient,
} from "./recipeTypes";

function ingredient(
    id: string,
    name: string,
    amount: string,
    matchKeys: string[] = [id],
    optional = false,
): RecipeIngredient {
    return {
        id,
        name,
        amount,
        matchKeys,
        ...(optional ? { optional: true } : {}),
    };
}

function recipe(
    data: Omit<LocalRecipe, "halalReview">,
): LocalRecipe {
    return {
        ...data,
        halalReview: {
            status: "not-certified",
            note:
                "No pork or alcohol is intentionally listed in this recipe. This recipe is not halal-certified; check packaged ingredients and sourcing.",
        },
    };
}

const flour = () =>
    ingredient(
        "flour",
        "Flour",
        "1 cup",
        ["flour", "whole wheat flour"],
    );

const egg = () =>
    ingredient("egg", "Egg", "1", ["egg"]);

const milk = () =>
    ingredient("milk", "Milk",
        "1/2 cup", ["milk"]);

const chocolate = () =>
    ingredient(
        "chocolate",
        "Chocolate or cocoa powder",
        "2 tbsp cocoa powder or 30 g chocolate",
        ["chocolate", "cocoa powder"],
    );

export const LOCAL_RECIPE_CATALOG: LocalRecipe[] = [
    recipe({
        id: "chocolate-mug-cake",
        title: "Chocolate Mug Cake",
        description:
            "A quick chocolate cake made with common baking ingredients.",
        servings: 1,
        prepMinutes: 5,
        cookMinutes: 2,
        tags: ["dessert", "chocolate", "quick"],
        ingredients: [
            flour(),
            egg(),
            milk(),
            chocolate(),
            ingredient("sugar", "Sugar", "2 tbsp"),
            ingredient("oil", "Neutral oil", "1 tbsp", ["oil"]),
            ingredient(
                "baking-powder",
                "Baking powder",
                "1/4 tsp",
                ["baking powder"],
            ),
        ],
        instructions: [
            "Mix the flour, sugar, and baking powder in a large microwave-safe mug.",
            "Stir in the egg, milk, and oil until no dry flour remains.",
            "Mix in the cocoa powder or finely chopped chocolate.",
            "Microwave in short intervals until the cake is cooked through. Let it cool before eating.",
        ],
    }),

    recipe({
        id: "chocolate-pancakes",
        title: "Chocolate Pancakes",
        description:
            "Soft cocoa pancakes for breakfast or a snack.",
        servings: 2,
        prepMinutes: 8,
        cookMinutes: 12,
        tags: ["breakfast", "chocolate"],
        ingredients: [
            flour(),
            egg(),
            milk(),
            chocolate(),
            ingredient("sugar", "Sugar", "2 tbsp"),
            ingredient(
                "baking-powder",
                "Baking powder",
                "1 tsp",
                ["baking powder"],
            ),
            ingredient("oil", "Neutral oil", "1 tbsp", ["oil"]),
        ],
        instructions: [
            "Combine the flour, cocoa powder, sugar, and baking powder.",
            "Whisk the egg and milk together, then stir into the dry ingredients.",
            "Add a little oil and mix until combined.",
            "Cook small portions in a lightly oiled pan, turning when bubbles form.",
            "Cook until both sides are done.",
        ],
    }),

    recipe({
        id: "banana-pancakes",
        title: "Banana Pancakes",
        description:
            "A simple way to use ripe bananas, eggs, and milk.",
        servings: 2,
        prepMinutes: 8,
        cookMinutes: 10,
        tags: ["breakfast", "banana"],
        ingredients: [
            ingredient("banana", "Banana", "1 medium"),
            flour(),
            egg(),
            milk(),
            ingredient(
                "baking-powder",
                "Baking powder",
                "1 tsp",
                ["baking powder"],
            ),
            ingredient("oil", "Neutral oil", "1 tbsp", ["oil"]),
        ],
        instructions: [
            "Mash the banana in a bowl.",
            "Whisk in the egg and milk.",
            "Fold in the flour and baking powder.",
            "Cook small pancakes in a lightly oiled pan over medium-low heat.",
            "Turn when the edges look set and cook until the centre is done.",
        ],
    }),

    recipe({
        id: "french-toast",
        title: "French Toast",
        description:
            "Golden bread slices with a simple egg and milk coating.",
        servings: 2,
        prepMinutes: 5,
        cookMinutes: 10,
        tags: ["breakfast", "bread"],
        ingredients: [
            ingredient("bread", "Bread", "4 slices"),
            egg(),
            milk(),
            ingredient("sugar", "Sugar", "1 tsp", ["sugar"], true),
            ingredient(
                "cinnamon",
                "Cinnamon",
                "1/4 tsp",
                ["cinnamon"],
                true,
            ),
            ingredient("oil", "Neutral oil", "1 tbsp", ["oil"]),
        ],
        instructions: [
            "Whisk the egg and milk together. Add sugar and cinnamon if using.",
            "Dip each bread slice into the mixture, coating both sides.",
            "Heat a lightly oiled pan over medium heat.",
            "Cook the bread on both sides until golden and the egg mixture is fully cooked.",
        ],
    }),

    recipe({
        id: "banana-chocolate-smoothie",
        title: "Banana Chocolate Smoothie",
        description:
            "A creamy drink made with banana, milk, and chocolate.",
        servings: 1,
        prepMinutes: 5,
        cookMinutes: 0,
        tags: ["drink", "banana", "chocolate", "no-cook"],
        ingredients: [
            ingredient("banana", "Banana", "1 medium"),
            milk(),
            chocolate(),
            ingredient(
                "yogurt",
                "Plain yogurt",
                "1/4 cup",
                ["yogurt"],
                true,
            ),
        ],
        instructions: [
            "Peel the banana and break it into pieces.",
            "Add the banana, milk, and cocoa powder or chocolate to a blender.",
            "Add yogurt if you want a thicker texture.",
            "Blend until smooth and serve immediately.",
        ],
    }),

    recipe({
        id: "chocolate-oat-bites",
        title: "Chocolate Oat Bites",
        description:
            "Small no-bake oat bites with banana and chocolate.",
        servings: 6,
        prepMinutes: 15,
        cookMinutes: 0,
        tags: ["snack", "oats", "chocolate", "no-cook"],
        ingredients: [
            ingredient("oats", "Oats", "1 cup", ["oats"]),
            ingredient("banana", "Banana", "1 ripe"),
            chocolate(),
            ingredient(
                "peanut-butter",
                "Peanut butter",
                "2 tbsp",
                ["peanut butter"],
                true,
            ),
            ingredient(
                "honey",
                "Honey",
                "1 tbsp",
                ["honey"],
                true,
            ),
        ],
        instructions: [
            "Mash the banana in a mixing bowl.",
            "Stir in the oats and cocoa powder or finely chopped chocolate.",
            "Add peanut butter and honey if using.",
            "Shape into small bites and refrigerate until firm.",
        ],
    }),

    recipe({
        id: "egg-fried-rice",
        title: "Egg Fried Rice",
        description:
            "A savoury rice dish using eggs and everyday vegetables.",
        servings: 2,
        prepMinutes: 10,
        cookMinutes: 12,
        tags: ["lunch", "dinner", "rice", "egg", "vegetarian"],
        ingredients: [
            egg(),
            ingredient("rice", "Cooked rice", "2 cups", ["rice"]),
            ingredient("carrot", "Carrot", "1 small"),
            ingredient("peas", "Green peas", "1/2 cup", ["peas"]),
            ingredient("onion", "Onion", "1 small"),
            ingredient("garlic", "Garlic", "1 clove"),
            ingredient("oil", "Cooking oil", "1 tbsp", ["oil"]),
            ingredient("salt", "Salt", "to taste"),
        ],
        instructions: [
            "Use rice that has been cooled and stored safely.",
            "Chop the onion, carrot, and garlic.",
            "Heat oil in a pan, then cook the onion and garlic until fragrant.",
            "Add the carrot and peas and cook until tender.",
            "Add the egg and stir until fully cooked.",
            "Mix in the rice, season to taste, and heat thoroughly.",
        ],
    }),

    recipe({
        id: "tomato-omelette",
        title: "Tomato Omelette",
        description:
            "Eggs cooked with tomato and onion for a quick meal.",
        servings: 1,
        prepMinutes: 5,
        cookMinutes: 8,
        tags: ["breakfast", "egg", "vegetarian"],
        ingredients: [
            egg(),
            ingredient("tomato", "Tomato", "1 medium"),
            ingredient("onion", "Onion", "1/4 small"),
            ingredient("oil", "Cooking oil", "1 tsp", ["oil"]),
            ingredient("salt", "Salt", "to taste"),
            ingredient(
                "black pepper",
                "Black pepper",
                "to taste",
                ["black pepper"],
                true,
            ),
        ],
        instructions: [
            "Chop the tomato and onion.",
            "Beat the egg with salt and pepper.",
            "Heat oil in a small pan and soften the onion and tomato.",
            "Pour in the egg and cook gently until set and fully cooked.",
            "Fold and serve warm.",
        ],
    }),

    recipe({
        id: "banana-oatmeal",
        title: "Banana Oatmeal",
        description:
            "Warm oats with banana and milk for a simple breakfast.",
        servings: 1,
        prepMinutes: 3,
        cookMinutes: 7,
        tags: ["breakfast", "oats", "banana"],
        ingredients: [
            ingredient("oats", "Oats", "1/2 cup", ["oats"]),
            milk(),
            ingredient("banana", "Banana", "1 medium"),
            ingredient(
                "honey",
                "Honey",
                "1 tsp",
                ["honey"],
                true,
            ),
            ingredient(
                "cinnamon",
                "Cinnamon",
                "a pinch",
                ["cinnamon"],
                true,
            ),
        ],
        instructions: [
            "Combine the oats and milk in a small saucepan.",
            "Cook gently, stirring, until the oats are soft.",
            "Slice the banana and add it to the bowl.",
            "Finish with honey or cinnamon if desired.",
        ],
    }),

    recipe({
        id: "fruit-yogurt-bowl",
        title: "Fruit and Yogurt Bowl",
        description:
            "A no-cook bowl with fruit, yogurt, and oats.",
        servings: 1,
        prepMinutes: 5,
        cookMinutes: 0,
        tags: ["breakfast", "snack", "no-cook"],
        ingredients: [
            ingredient("yogurt", "Plain yogurt", "1 cup", ["yogurt"]),
            ingredient("banana", "Banana", "1/2 medium"),
            ingredient("apple", "Apple", "1 small"),
            ingredient("oats", "Oats", "2 tbsp", ["oats"], true),
            ingredient(
                "honey",
                "Honey",
                "1 tsp",
                ["honey"],
                true,
            ),
        ],
        instructions: [
            "Spoon the yogurt into a bowl.",
            "Wash and chop the apple, then slice the banana.",
            "Arrange the fruit over the yogurt.",
            "Add oats and honey if desired.",
        ],
    }),

    recipe({
        id: "apple-pancakes",
        title: "Apple Pancakes",
        description:
            "Light pancakes with grated apple and cinnamon.",
        servings: 2,
        prepMinutes: 10,
        cookMinutes: 12,
        tags: ["breakfast", "apple", "vegetarian"],
        ingredients: [
            ingredient("apple", "Apple", "1 small"),
            flour(),
            egg(),
            milk(),
            ingredient("sugar", "Sugar", "1 tbsp", ["sugar"], true),
            ingredient(
                "baking-powder",
                "Baking powder",
                "1 tsp",
                ["baking powder"],
            ),
            ingredient(
                "cinnamon",
                "Cinnamon",
                "1/4 tsp",
                ["cinnamon"],
                true,
            ),
            ingredient("oil", "Cooking oil", "1 tbsp", ["oil"]),
        ],
        instructions: [
            "Wash and grate the apple.",
            "Whisk the egg and milk together.",
            "Stir in the flour, baking powder, apple, and cinnamon.",
            "Heat a lightly oiled pan.",
            "Cook small pancakes on both sides until golden and cooked through.",
        ],
    }),

    recipe({
        id: "potato-egg-skillet",
        title: "Potato and Egg Skillet",
        description:
            "A filling pan-cooked meal with potato, egg, and onion.",
        servings: 2,
        prepMinutes: 8,
        cookMinutes: 18,
        tags: ["lunch", "dinner", "egg", "potato"],
        ingredients: [
            ingredient("potato", "Potato", "2 medium"),
            egg(),
            ingredient("onion", "Onion", "1 small"),
            ingredient("oil", "Cooking oil", "1 tbsp", ["oil"]),
            ingredient("salt", "Salt", "to taste"),
            ingredient(
                "black pepper",
                "Black pepper",
                "to taste",
                ["black pepper"],
                true,
            ),
        ],
        instructions: [
            "Wash and dice the potatoes into small pieces.",
            "Chop the onion.",
            "Heat oil in a covered skillet and cook the potatoes until tender, stirring occasionally.",
            "Add the onion and cook until softened.",
            "Add the egg and cook until fully set. Season and serve.",
        ],
    }),

    recipe({
        id: "vegetable-rice",
        title: "Simple Vegetable Rice",
        description:
            "Rice cooked with carrots, peas, and onion.",
        servings: 2,
        prepMinutes: 8,
        cookMinutes: 18,
        tags: ["lunch", "dinner", "rice", "vegetarian"],
        ingredients: [
            ingredient("rice", "Rice", "1 cup", ["rice"]),
            ingredient("carrot", "Carrot", "1 small"),
            ingredient("peas", "Green peas", "1/2 cup", ["peas"]),
            ingredient("onion", "Onion", "1 small"),
            ingredient("oil", "Cooking oil", "1 tbsp", ["oil"]),
            ingredient("salt", "Salt", "to taste"),
        ],
        instructions: [
            "Rinse the rice.",
            "Chop the onion and carrot.",
            "Heat oil in a saucepan and cook the onion until softened.",
            "Add the carrot, peas, rice, water, and salt.",
            "Cover and cook until the rice is tender and the liquid is absorbed.",
        ],
    }),

    recipe({
        id: "chickpea-tomato-curry",
        title: "Chickpea and Tomato Curry",
        description:
            "A plant-based curry made with chickpeas and tomatoes.",
        servings: 2,
        prepMinutes: 8,
        cookMinutes: 20,
        tags: ["lunch", "dinner", "vegetarian", "plant-based"],
        ingredients: [
            ingredient("chickpea", "Chickpeas", "1 can, drained", ["chickpea"]),
            ingredient("tomato", "Tomato", "2 medium"),
            ingredient("onion", "Onion", "1 medium"),
            ingredient("garlic", "Garlic", "2 cloves"),
            ingredient("cumin", "Ground cumin", "1/2 tsp", ["cumin"]),
            ingredient("oil", "Cooking oil", "1 tbsp", ["oil"]),
            ingredient("salt", "Salt", "to taste"),
        ],
        instructions: [
            "Chop the onion, tomatoes, and garlic.",
            "Heat oil in a pan and cook the onion until softened.",
            "Add the garlic and cumin and stir briefly.",
            "Add the tomatoes and cook until they soften.",
            "Stir in the drained chickpeas and a little water.",
            "Simmer until heated through, then season to taste.",
        ],
    }),

    recipe({
        id: "chapati-flatbread",
        title: "Simple Chapati",
        description:
            "A basic whole-wheat flatbread made from flour, water, and salt.",
        servings: 4,
        prepMinutes: 15,
        cookMinutes: 12,
        tags: ["bread", "vegetarian", "plant-based"],
        ingredients: [
            ingredient(
                "whole-wheat-flour",
                "Whole-wheat flour (atta)",
                "1 cup",
                ["whole wheat flour", "flour"],
            ),
            ingredient("water", "Water", "as needed"),
            ingredient("salt", "Salt", "a pinch"),
            ingredient(
                "oil",
                "Oil",
                "1 tsp",
                ["oil"],
                true,
            ),
        ],
        instructions: [
            "Mix the flour and salt in a bowl.",
            "Gradually add water and knead into a soft dough.",
            "Rest the dough for about 10 minutes.",
            "Divide into balls and roll each into a thin circle.",
            "Cook on a hot pan, turning until both sides are cooked. Handle the hot pan carefully.",
        ],
    }),

    recipe({
        id: "chocolate-banana-toast",
        title: "Chocolate Banana Toast",
        description:
            "A quick sweet toast with banana and chocolate.",
        servings: 1,
        prepMinutes: 5,
        cookMinutes: 4,
        tags: ["snack", "breakfast", "chocolate", "banana"],
        ingredients: [
            ingredient("bread", "Bread", "2 slices"),
            ingredient(
                "chocolate spread",
                "Chocolate spread or chopped chocolate",
                "2 tbsp",
                ["chocolate spread", "chocolate"],
            ),
            ingredient("banana", "Banana", "1 medium"),
        ],
        instructions: [
            "Toast the bread until lightly crisp.",
            "Spread the chocolate spread or add finely chopped chocolate.",
            "Slice the banana and arrange it on the toast.",
            "Serve immediately.",
        ],
    }),

    recipe({
        id: "apple-oatmeal",
        title: "Apple Cinnamon Oatmeal",
        description:
            "Warm oats with apple and a little cinnamon.",
        servings: 1,
        prepMinutes: 5,
        cookMinutes: 8,
        tags: ["breakfast", "apple", "oats"],
        ingredients: [
            ingredient("oats", "Oats", "1/2 cup", ["oats"]),
            milk(),
            ingredient("apple", "Apple", "1 small"),
            ingredient("sugar", "Sugar", "1 tsp", ["sugar"], true),
            ingredient(
                "cinnamon",
                "Cinnamon",
                "1/4 tsp",
                ["cinnamon"],
                true,
            ),
        ],
        instructions: [
            "Wash and chop the apple.",
            "Add the oats and milk to a saucepan.",
            "Stir in the apple and cook gently until the oats soften.",
            "Add cinnamon and sugar if desired.",
            "Serve warm.",
        ],
    }),


    recipe({
        id: "masoor-dal-tadka",
        title: "Masoor Dal Tadka",
        description:
            "A comforting red lentil curry with tomato, garlic, and cumin.",
        servings: 3,
        prepMinutes: 10,
        cookMinutes: 25,
        tags: ["lunch", "dinner", "vegetarian", "lentils"],
        ingredients: [
            ingredient(
                "masoor-dal",
                "Red lentils (Masoor dal)",
                "1 cup",
                ["masoor dal", "red lentils", "lentils"],
            ),
            ingredient("onion", "Onion", "1 medium"),
            ingredient("tomato", "Tomato", "1 medium"),
            ingredient("garlic", "Garlic", "2 cloves"),
            ingredient("ginger", "Ginger", "1 tsp"),
            ingredient("cumin", "Cumin seeds", "1 tsp", ["cumin"]),
            ingredient("turmeric", "Turmeric", "1/2 tsp"),
            ingredient("oil", "Cooking oil", "1 tbsp", ["oil"]),
            ingredient("salt", "Salt", "to taste"),
            ingredient(
                "coriander-leaves",
                "Fresh coriander leaves",
                "2 tbsp",
                ["coriander leaves"],
                true,
            ),
        ],
        instructions: [
            "Rinse the red lentils until the water runs clearer.",
            "Simmer the lentils with water and turmeric until soft.",
            "Heat oil in another pan and cook the onion until softened.",
            "Add ginger, garlic, tomato, and cumin. Cook until the tomato softens.",
            "Mix the tempering into the cooked lentils.",
            "Season with salt and garnish with coriander leaves if desired.",
        ],
    }),

    recipe({
        id: "chana-masala",
        title: "Chana Masala",
        description:
            "A chickpea curry with tomato, onion, ginger, and spices.",
        servings: 3,
        prepMinutes: 10,
        cookMinutes: 25,
        tags: ["lunch", "dinner", "vegetarian", "chickpeas"],
        ingredients: [
            ingredient("chickpea", "Chickpeas", "1 can, drained", ["chickpea"]),
            ingredient("onion", "Onion", "1 medium"),
            ingredient("tomato", "Tomato", "2 medium"),
            ingredient("ginger", "Ginger", "1 tsp"),
            ingredient("garlic", "Garlic", "2 cloves"),
            ingredient("cumin", "Ground cumin", "1 tsp", ["cumin"]),
            ingredient("turmeric", "Turmeric", "1/2 tsp"),
            ingredient("garam-masala", "Garam masala", "1 tsp"),
            ingredient("oil", "Cooking oil", "1 tbsp", ["oil"]),
            ingredient("salt", "Salt", "to taste"),
            ingredient(
                "coriander-leaves",
                "Coriander leaves",
                "2 tbsp",
                ["coriander leaves"],
                true,
            ),
        ],
        instructions: [
            "Drain and rinse the chickpeas.",
            "Chop the onion and tomatoes.",
            "Heat oil and cook the onion until softened.",
            "Add ginger, garlic, cumin, and turmeric.",
            "Add the tomatoes and cook until they form a thick sauce.",
            "Stir in the chickpeas, garam masala, and a little water.",
            "Simmer until heated through and the sauce thickens.",
            "Season and garnish with coriander leaves if desired.",
        ],
    }),

    recipe({
        id: "aloo-gobi",
        title: "Aloo Gobi",
        description:
            "A traditional potato and cauliflower dish with warming spices.",
        servings: 3,
        prepMinutes: 12,
        cookMinutes: 25,
        tags: ["lunch", "dinner", "vegetarian"],
        ingredients: [
            ingredient("potato", "Potatoes", "2 medium", ["potato"]),
            ingredient(
                "cauliflower",
                "Cauliflower",
                "2 cups",
                ["cauliflower"],
            ),
            ingredient("onion", "Onion", "1 medium"),
            ingredient("tomato", "Tomato", "1 medium"),
            ingredient("cumin", "Cumin seeds", "1 tsp", ["cumin"]),
            ingredient("turmeric", "Turmeric", "1/2 tsp"),
            ingredient("oil", "Cooking oil", "1 tbsp", ["oil"]),
            ingredient("salt", "Salt", "to taste"),
            ingredient(
                "coriander-leaves",
                "Coriander leaves",
                "2 tbsp",
                ["coriander leaves"],
                true,
            ),
        ],
        instructions: [
            "Wash and cut the potatoes and cauliflower into bite-sized pieces.",
            "Chop the onion and tomato.",
            "Heat oil and add cumin seeds.",
            "Add onion and cook until softened.",
            "Add tomato, turmeric, and salt.",
            "Add potato and cauliflower and mix well.",
            "Cover and cook gently, stirring occasionally, until the vegetables are tender.",
            "Garnish with coriander leaves if desired.",
        ],
    }),

    recipe({
        id: "vegetable-pulao",
        title: "Vegetable Pulao",
        description:
            "Fragrant rice cooked with peas, carrots, and mild spices.",
        servings: 3,
        prepMinutes: 10,
        cookMinutes: 25,
        tags: ["lunch", "dinner", "rice", "vegetarian"],
        ingredients: [
            ingredient("rice", "Basmati rice", "1 cup", ["rice"]),
            ingredient("carrot", "Carrot", "1 medium"),
            ingredient("peas", "Green peas", "1/2 cup", ["peas"]),
            ingredient("onion", "Onion", "1 medium"),
            ingredient("cumin", "Cumin seeds", "1 tsp", ["cumin"]),
            ingredient("oil", "Cooking oil", "1 tbsp", ["oil"]),
            ingredient("salt", "Salt", "to taste"),
        ],
        instructions: [
            "Rinse the rice and soak briefly if desired.",
            "Chop the carrot and onion.",
            "Heat oil in a saucepan and add cumin.",
            "Add onion and cook until softened.",
            "Add carrots and peas and stir for a few minutes.",
            "Add rice, water, and salt.",
            "Cover and cook until the rice is tender and the water is absorbed.",
            "Let the pulao rest briefly before serving.",
        ],
    }),

    recipe({
        id: "palak-aloo",
        title: "Palak Aloo",
        description:
            "A spinach and potato curry with garlic and simple spices.",
        servings: 3,
        prepMinutes: 12,
        cookMinutes: 25,
        tags: ["lunch", "dinner", "vegetarian", "spinach"],
        ingredients: [
            ingredient("spinach", "Spinach", "2 cups"),
            ingredient("potato", "Potatoes", "2 medium", ["potato"]),
            ingredient("onion", "Onion", "1 medium"),
            ingredient("tomato", "Tomato", "1 medium"),
            ingredient("garlic", "Garlic", "2 cloves"),
            ingredient("cumin", "Cumin seeds", "1 tsp", ["cumin"]),
            ingredient("turmeric", "Turmeric", "1/2 tsp"),
            ingredient("oil", "Cooking oil", "1 tbsp", ["oil"]),
            ingredient("salt", "Salt", "to taste"),
        ],
        instructions: [
            "Wash the spinach thoroughly and chop it.",
            "Peel and dice the potatoes.",
            "Heat oil and cook the cumin and onion.",
            "Add garlic, tomato, and turmeric.",
            "Add potatoes and enough water to help them cook.",
            "When the potatoes are nearly tender, add spinach.",
            "Cook until the vegetables are fully tender and season to taste.",
        ],
    }),

    recipe({
        id: "jeera-rice",
        title: "Jeera Rice",
        description:
            "A simple rice dish flavoured with cumin seeds.",
        servings: 2,
        prepMinutes: 5,
        cookMinutes: 20,
        tags: ["rice", "side-dish", "vegetarian"],
        ingredients: [
            ingredient("rice", "Basmati rice", "1 cup", ["rice"]),
            ingredient("cumin", "Cumin seeds", "1 tsp", ["cumin"]),
            ingredient("oil", "Cooking oil", "1 tsp", ["oil"]),
            ingredient("salt", "Salt", "to taste"),
        ],
        instructions: [
            "Rinse the rice.",
            "Heat oil in a saucepan and briefly cook the cumin seeds.",
            "Add rice, water, and salt.",
            "Cover and cook until the rice is tender.",
            "Allow it to rest briefly before serving.",
        ],
    }),

    recipe({
        id: "besan-chilla",
        title: "Besan Chilla",
        description:
            "A savoury gram flour pancake with onion and tomato.",
        servings: 2,
        prepMinutes: 10,
        cookMinutes: 12,
        tags: ["breakfast", "snack", "vegetarian"],
        ingredients: [
            ingredient(
                "gram-flour",
                "Gram flour (Besan)",
                "1 cup",
                ["gram flour", "besan", "chickpea flour"],
            ),
            ingredient("onion", "Onion", "1/2 small"),
            ingredient("tomato", "Tomato", "1 small"),
            ingredient("turmeric", "Turmeric", "1/4 tsp"),
            ingredient("cumin", "Cumin", "1/2 tsp", ["cumin"]),
            ingredient("oil", "Cooking oil", "1 tbsp", ["oil"]),
            ingredient("salt", "Salt", "to taste"),
            ingredient(
                "coriander-leaves",
                "Fresh coriander leaves",
                "1 tbsp",
                ["coriander leaves"],
                true,
            ),
            ingredient(
                "chili",
                "Green chili",
                "1 small",
                ["chili"],
                true,
            ),
        ],
        instructions: [
            "Add the gram flour to a bowl.",
            "Gradually add water and mix into a smooth, pourable batter.",
            "Stir in chopped onion, tomato, turmeric, cumin, and salt.",
            "Add coriander leaves and green chili if desired.",
            "Heat a lightly oiled pan.",
            "Spread a portion of batter into a thin circle.",
            "Cook both sides until golden and cooked through.",
        ],
    }),

    recipe({
        id: "rice-kheer",
        title: "Rice Kheer",
        description:
            "A creamy rice pudding cooked with milk and cardamom.",
        servings: 4,
        prepMinutes: 5,
        cookMinutes: 40,
        tags: ["dessert", "milk", "rice", "vegetarian"],
        ingredients: [
            ingredient("rice", "Rice", "1/4 cup", ["rice"]),
            ingredient("milk", "Milk", "4 cups", ["milk"]),
            ingredient("sugar", "Sugar", "1/3 cup", ["sugar"]),
            ingredient("cardamom", "Cardamom", "3 pods", ["cardamom"]),
            ingredient(
                "almonds",
                "Almonds",
                "2 tbsp",
                ["almonds", "almond"],
                true,
            ),
        ],
        instructions: [
            "Rinse the rice.",
            "Bring the milk to a gentle simmer in a saucepan.",
            "Add rice and cook over low heat, stirring regularly.",
            "Continue cooking until the rice softens and the mixture thickens.",
            "Add sugar and cardamom and stir until dissolved.",
            "Add almonds if desired.",
            "Cool before serving or refrigerate for a chilled dessert.",
        ],
    }),
];
