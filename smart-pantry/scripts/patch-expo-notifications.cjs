
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

const packageJsonPath = path.join(
    root,
    "node_modules",
    "expo-notifications",
    "package.json"
);

const targetPath = path.join(
    root,
    "node_modules",
    "expo-notifications",
    "build",
    "TopicSubscriptionModule.android.js"
);

if (!fs.existsSync(packageJsonPath) || !fs.existsSync(targetPath)) {
    console.error(
        "Could not find the expected expo-notifications files."
    );
    process.exit(1);
}

const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, "utf8")
);

if (packageJson.version !== "58.1.6") {
    console.error(
        `This workaround expects expo-notifications 58.1.6, ` +
        `but found ${packageJson.version}.`
    );
    process.exit(1);
}

let source = fs.readFileSync(targetPath, "utf8");

if (source.includes("requireOptionalNativeModule")) {
    console.log("Expo notifications import workaround is already applied.");
    process.exit(0);
}

const originalCall =
    /exports\.default\s*=\s*\(0,\s*expo_1\.requireNativeModule\)\("ExpoTopicSubscriptionModule"\);?/;

if (!originalCall.test(source)) {
    console.error(
        "The expected native module import was not found. " +
        "No changes were made."
    );
    process.exit(1);
}

source = source.replace(
    originalCall,
    'exports.default = (0, expo_1.requireOptionalNativeModule)("ExpoTopicSubscriptionModule") ?? {};'
);

fs.writeFileSync(targetPath, source, "utf8");

console.log(
    "Applied the ExpoTopicSubscriptionModule import workaround."
);
