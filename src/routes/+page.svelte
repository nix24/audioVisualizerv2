<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import AudioMotionAnalyzer from 'audiomotion-analyzer';
	import type { YTMetadata } from '$lib/types';
	import { onMount } from 'svelte';
	import { extractColors } from 'extract-colors';
	import type { FinalColor } from 'extract-colors/lib/types/Color';
	//audio source is audio element gotten by id
	let audio: HTMLAudioElement;
	let audioMotion: AudioMotionAnalyzer;
	let youtubeUrl = 'https://youtu.be/8Yec-3UfWII?si=oCqNuvQ8wkcp286V';
	let metadata: YTMetadata;
	let isLoading = false;

	onMount(() => {
		//set height dynamically based on window height
		audio = document.getElementById('audio') as HTMLAudioElement;
		audioMotion = new AudioMotionAnalyzer(document.getElementById('container') as HTMLElement, {
			source: audio,
			height: 500,
			width: 1000,
			alphaBars: false,
			ansiBands: true,
			barSpace: 0.25,
			bgAlpha: 0,
			channelLayout: 'single',
			colorMode: 'gradient',
			fftSize: 8192,
			fillAlpha: 0.6,
			frequencyScale: 'log',
			gradient: 'rainbow',
			ledBars: false,
			linearAmplitude: true,
			linearBoost: 1.8,
			lineWidth: 1.5,
			loRes: false,
			lumiBars: false,
			maxDecibels: -25,
			maxFPS: 0,
			maxFreq: 20000,
			minDecibels: -85,
			minFreq: 20,
			mirror: 1,
			mode: 2,
			noteLabels: false,
			outlineBars: false,
			overlay: true,
			peakLine: false,
			radial: false,
			radialInvert: false,
			radius: 0.3,
			reflexAlpha: 0.25,
			reflexFit: true,
			reflexRatio: 0.3,
			roundBars: false,
			showBgColor: true,
			showFPS: false,
			showPeaks: true,
			showScaleX: false,
			showScaleY: false,
			smoothing: 0.5,
			spinSpeed: 1,
			splitGradient: false,
			trueLeds: true,
			useCanvas: true,
			volume: 1,
			weightingFilter: 'D'
		});
	});
	function handleFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.item(0);
		if (file) {
			const url = URL.createObjectURL(file);
			audio.src = url;
		}
	}
	const getMetadata = async () => {
		const videoUrl: string = youtubeUrl;
		const requestUrl: string = `http://youtube.com/oembed?url=${videoUrl}&format=json`;
		const result = await fetch(requestUrl);
		metadata = await result.json();
	};
	const getYTAudio = async () => {
		console.log('getting audio');
		const requestUrl = `/api/ytAudio?url=${encodeURIComponent(youtubeUrl)}`;
		console.log('audio found, awaiting response');
		const res = await fetch(requestUrl);
		const audioBlob = await res.blob();
		const audioUrl = URL.createObjectURL(audioBlob);
		console.log('response received, setting audio source');
		audio.src = audioUrl;
	};

	const handleVisualizer = async () => {
		isLoading = true;
		//grab the id file-input and youtube-input to disable them while loading
		const fileInput = document.getElementById('file-input') as HTMLInputElement;
		const youtubeInput = document.getElementById('youtube-input') as HTMLFormElement;
		fileInput.disabled = true;
		youtubeInput.disabled = true;
		await getYTAudio();
		await getMetadata();
		const colorPalette = await extractColorPalette(metadata.thumbnail_url);
		applyBackgroundColor(colorPalette);
		isLoading = false;
		fileInput.disabled = false;
		youtubeInput.disabled = false;
	};

	const extractColorPalette = async (imageURL: string) => {
		const proxyURL = `/api/thumbnailUrl?url=${encodeURIComponent(imageURL)}`;
		const options = {
			pixels: 64000,
			distance: 0.22,
			saturationDistance: 0.2,
			lightnessDistance: 0.2,
			hueDistance: 0.083333333,
			count: 5
		};
		const colors: FinalColor[] = await extractColors(proxyURL, options);
		return colors.map((color) => color.hex);
	};
	const applyBackgroundColor = (colors: string[]) => {
		audioMotion.registerGradient('thumbnailGradient', {
			bgColor: '#000',
			dir: 'h',
			colorStops: colors
		});
		audioMotion.gradient = 'thumbnailGradient';
		const container = document.getElementById('mainContainer');
		if (container) {
			//convert the colors map to an array of hex values ['hex1', 'hex2', 'hex3']
			const hexColors = Object.values(colors).map((color) => color.color);
			console.log(hexColors);
			container.style.background = `linear-gradient(45deg, ${hexColors.join(', ')})`;
			console.log(`linear-gradient(45deg, ${hexColors.join(', ')})`);
		}
	};
</script>

<main id="mainContainer">
	<div class="flex min-h-screen flex-col items-center">
		<div class="flex items-center">
			<Input
				type="file"
				id="file-input"
				accept="audio/*"
				on:change={handleFileChange}
				class="Dfile-input Dfile-input-md mb-4"
			/>
		</div>
		<form on:submit|preventDefault={handleVisualizer} class="Djoin mb-8 flex">
			<Input
				class="Dinput Djoin-item max-w-xs ring-1 ring-secondary focus:ring-2 focus:ring-primary"
				type="text"
				bind:value={youtubeUrl}
				placeholder="Enter youtube URL link"
			/>
			<Button id="youtube-input" class="Dbtn Djoin-item Dbtn-sm" type="submit"
				>Load Visualizer</Button
			>
		</form>
		{#if isLoading}
			<div class="loading-overlay">Loading...</div>
		{/if}
		<div class="z-10 flex flex-1 flex-col items-center px-10">
			{#if metadata}
				<div class="mb-8 flex flex-col items-center">
					<img
						class="mb-4 h-40 w-40 rounded-full border"
						src={metadata.thumbnail_url}
						alt={metadata.title}
					/>
					<h2 class="pulse mb-2 p-10 text-2xl font-bold">{metadata.title}</h2>
					<p class="text-lg">{metadata.author_name}</p>
				</div>
			{:else}
				<div class="mb-8 flex items-center justify-center">
					<img
						class="h-40 w-40 rounded-full"
						src="https://via.placeholder.com/200"
						alt="placeholder"
					/>
				</div>
			{/if}
			<audio controls id="audio" crossorigin="anonymous" loop>
				<source src="" type="audio/mpeg" />
				Your browser does not support the audio element.
			</audio>
		</div>
		<div
			id="container"
			class="fixed bottom-0 left-0 right-0 flex items-center justify-center"
		></div>
	</div>
</main>

<style>
	audio {
		width: 100%;
		height: 40px;
		background-color: transparent;
		border: none;
		outline: none;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10px);
		opacity: 0.9;
	}

	audio::-webkit-media-controls-panel {
		background-color: transparent;
		border-radius: 20px;
		padding: 0 10px;
	}

	audio::-webkit-media-controls-play-button {
		background-color: transparent;
		border-radius: 50%;
		width: 30px;
		height: 30px;
		margin-right: 10px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	audio::-webkit-media-controls-timeline-container {
		background-color: transparent;
		border-radius: 10px;
		padding: 5px;
	}

	audio::-webkit-media-controls-current-time-display,
	audio::-webkit-media-controls-time-remaining-display {
		font-size: 12px;
	}

	audio::-webkit-media-controls-timeline {
		border-radius: 10px;
		height: 10px;
	}

	audio::-webkit-media-controls-volume-slider-container {
		width: 60px;
	}

	audio::-webkit-media-controls-volume-slider {
		border-radius: 10px;
		height: 10px;
	}

	audio::-webkit-media-controls-mute-button {
		background-color: transparent;
		border-radius: 50%;
		width: 30px;
		height: 30px;
		margin-left: 10px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
</style>
