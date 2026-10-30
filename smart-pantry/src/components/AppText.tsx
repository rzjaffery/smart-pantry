
import {
    Text as NativeText,
    type TextProps,
    type TextStyle,
} from "react-native";

type AppTextProps = TextProps & {
    className?: string;
};

const FONT_WEIGHT_MAP: Record<string, string> = {
    "font-thin": "font-satoshi",
    "font-extralight": "font-satoshi",
    "font-light": "font-satoshi",
    "font-normal": "font-satoshi",
    "font-medium": "font-satoshi-medium",
    "font-semibold": "font-satoshi-medium",
    "font-bold": "font-satoshi-bold",
    "font-extrabold": "font-satoshi-black",
    "font-black": "font-satoshi-black",
};

const FONT_SIZE_MAP: Record<string, number> = {
    "text-xs": 12,
    "text-sm": 14,
    "text-base": 16,
    "text-lg": 18,
    "text-xl": 20,
    "text-2xl": 24,
    "text-3xl": 30,
    "text-4xl": 36,
};

export function AppText({
                            className = "",
                            style,
                            ...props
                        }: AppTextProps) {
    const classes = className.split(/\s+/).filter(Boolean);

    const requestedWeight = classes.find((className) =>
        Object.prototype.hasOwnProperty.call(
            FONT_WEIGHT_MAP,
            className,
        ),
    );

    const fontFamilyClass = requestedWeight
        ? FONT_WEIGHT_MAP[requestedWeight]
        : "font-satoshi";

    const cleanedClassName = classes
        .filter(
            (className) =>
                !Object.prototype.hasOwnProperty.call(
                    FONT_WEIGHT_MAP,
                    className,
                ),
        )
        .join(" ");

    const fontSizeClass = [...classes]
        .reverse()
        .find((className) =>
            Object.prototype.hasOwnProperty.call(
                FONT_SIZE_MAP,
                className,
            ),
        );

    const hasExplicitLineHeight = classes.some((className) =>
        className.startsWith("leading-"),
    );

    const fontSize = fontSizeClass
        ? FONT_SIZE_MAP[fontSizeClass]
        : undefined;

    const defaultBodyStyle: TextStyle | undefined =
        fontSize && !hasExplicitLineHeight
            ? { lineHeight: fontSize * 1.4 }
            : undefined;

    const finalClassName = [
        cleanedClassName,
        fontFamilyClass,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <NativeText
            {...props}
            className={finalClassName}
            style={[defaultBodyStyle, style]}
        />
    );
}
