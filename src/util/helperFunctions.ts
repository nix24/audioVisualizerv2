import type { GradientColor } from "$lib/types";
import type AudioMotionAnalyzer from "audiomotion-analyzer";
import { extractColors } from "extract-colors";
import type { FinalColor } from "extract-colors/lib/types/Color";

export const extractColorPalette = async (imageURL: string) => {
	const proxyURL = `/api/thumbnailUrl?url=${encodeURIComponent(imageURL)}`;
	const options = {
		pixels: 64000,
		distance: 0.22,
		saturationDistance: 0.2,
		lightnessDistance: 0.2,
		hueDistance: 0.083333333,
		count: 10,
	};
	const colors: FinalColor[] = await extractColors(proxyURL, options);
	return colors.map((color) => color.hex);
};

export const applyBackgroundColor = (
	audioMotion: AudioMotionAnalyzer,
	colors: GradientColor[],
) => {
	audioMotion.registerGradient("thumbnailGradient", {
		bgColor: "#000",
		dir: "h",
		colorStops: colors,
	});
	audioMotion.gradient = "thumbnailGradient";

	const container = document.getElementById("mainContainer");
	if (container) {
		const hexColors: string[] = colors.map((color) => color.color);
		console.log(hexColors);
		//need to extract color into array
		// const gradient = hexColors.join(", ");
		const gradientColors = hexColors.map((color, index) => {
			const opacity = 1 - index / (hexColors.length - 1);
			return `${color}${Math.round(opacity * 255)
				.toString(16)
				.padStart(2, "0")}`;
		});
		const gradient = `radial-gradient(circle at center, ${gradientColors.join(
			", ",
		)})`;
		console.log(gradient);
		container.style.background = gradient;
		container.style.backgroundSize = "cover";
		container.style.backgroundPosition = "center";
		container.style.filter = "brightness(0.7)";
	}
	console.log("gradient applied");
};

export const getMetadata = async (youtubeUrl: string) => {
	const videoUrl: string = youtubeUrl;
	const requestUrl: string = `https://youtube.com/oembed?url=${videoUrl}&format=json`;
	const result = await fetch(requestUrl);
	const metadata = await result.json();
	return metadata;
};

export const getYTAudio = async (
	youtubeUrl: string,
	audio: HTMLAudioElement,
) => {
	console.log("getting audio");
	const requestUrl = `/api/ytAudio?url=${encodeURIComponent(youtubeUrl)}`;
	console.log("audio found, awaiting response");
	const res = await fetch(requestUrl);
	const audioBlob = await res.blob();
	const audioUrl = URL.createObjectURL(audioBlob);
	console.log("response received, setting audio source");
	audio.src = audioUrl;
};

//export all functions
export default {
	extractColorPalette,
	applyBackgroundColor,
	getMetadata,
	getYTAudio,
};
