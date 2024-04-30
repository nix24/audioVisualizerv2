<script lang="ts">
	import AudioMotionAnalyzer from 'audiomotion-analyzer';
	import type { YTMetadata } from '$lib/types';
	import { onDestroy, onMount } from 'svelte';
	import {
		extractColorPalette,
		applyBackgroundColor,
		getMetadata,
		getYTAudio
	} from '../util/helperFunctions';
	import { createAudioMotionConfig } from '../util/audioMotionConfig';

	//audio source is audio element gotten by id
	let audio: HTMLAudioElement;
	let audioMotion: AudioMotionAnalyzer;
	// biome-ignore lint/style/useConst: <explanation>
	let youtubeUrl =
		'https://www.youtube.com/watch?v=yH88qRmgkGI&pp=ygUUY29weXJpZ2h0IGZyZWUgbXVzaWM%3D';
	let metadata: YTMetadata;
	let isLoading = false;
	// biome-ignore lint/suspicious/noConfusingLabels: <explanation>
	$: width = 1000;
	// biome-ignore lint/suspicious/noConfusingLabels: <explanation>
	$: height = 1000;
	// biome-ignore lint/suspicious/noConfusingLabels: <explanation>
	$: console.log(width, height);
	let fileInput: HTMLInputElement;
	let youtubeInput: HTMLButtonElement;
	let mode = 'youtube';
	onMount(() => {
		//set height dynamically based on window height
		audio = document.getElementById('audio') as HTMLAudioElement;
		const audioMotionConfig = createAudioMotionConfig(audio, width, height);
		audioMotion = new AudioMotionAnalyzer(
			document.getElementById('container') as HTMLElement,
			audioMotionConfig
		);

		window.addEventListener('resize', () => {
			height = window.innerHeight;
			width = window.innerWidth;
			const visualizerContainer = document.getElementsByClassName(
				'visualizer-container'
			)[0] as HTMLElement;
			//if hieght is greater than 550 and less than 1000
			if (height > 550 && height < 800) {
				visualizerContainer.style.height = `${height - 400}px`;
			}
		});
	});
	onDestroy(() => {
		if (audioMotion) audioMotion.destroy();
		if (audio) audio.pause();
	});
	function switchMode(selectedMode: string) {
		mode = selectedMode;
	}
	function handleFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.item(0);
		if (file) {
			const url = URL.createObjectURL(file);
			audio.src = url;
		}
	}

	const handleVisualizer = async () => {
		isLoading = true;
		//grab the id file-input and youtube-input to disable them while loading
		if (fileInput && youtubeInput) {
			fileInput.disabled = true;
			youtubeInput.disabled = true;
		}
		await getYTAudio(youtubeUrl, audio);
		metadata = await getMetadata(youtubeUrl);
		const colorPalette = await extractColorPalette(metadata.thumbnail_url);
		applyBackgroundColor(audioMotion, colorPalette);
		isLoading = false;
		if (fileInput && youtubeInput) {
			fileInput.disabled = false;
			youtubeInput.disabled = false;
		}
	};
</script>

<main class="mx-auto flex flex-col items-center backdrop-blur-lg" id="mainContainer ">
	{#if isLoading}
		<div class="loading-overlay">Loading...</div>
	{/if}
	<div class="content-wrapper z-[2]">
		<div class="z-10 mb-32 flex flex-1 flex-col items-center p-10">
			{#if metadata}
				<div class="mb-8 flex flex-col items-center justify-center">
					<img
						class="h-42 mb-4 w-40 rounded-lg border object-cover"
						src={metadata.thumbnail_url}
						alt={metadata.title}
					/>
					<h2 class="mb-2 animate-pulse rounded-badge bg-base-300 p-5 text-lg font-bold">
						{metadata.title}
					</h2>
					<p class="text-lg">{metadata.author_name}</p>
				</div>
			{:else}
				<div class="mb-8 flex items-center justify-center">
					<img
						class="mb-4 h-28 w-40 rounded-lg border object-cover"
						src="https://via.placeholder.com/200"
						alt="placeholder"
					/>
				</div>
			{/if}
			<audio controls id="audio" crossorigin="anonymous" loop>
				<source src="" type="audio/mpeg" />
				Your browser does not support the audio element.
			</audio>
			<div class="mt-5">
				{#if mode === 'mp3'}
					<!-- MP3 file input -->
					<div class="flex cursor-pointer items-center">
						<input
							type="file"
							id="file-input"
							accept="audio/*"
							on:change={handleFileChange}
							bind:this={fileInput}
							class="Dfile-input Dfile-input-bordered mb-4"
						/>
					</div>
				{:else}
					<!-- YouTube URL input -->
					<form on:submit|preventDefault={handleVisualizer} class="Djoin z-20 mb-8 flex">
						<input
							class="Dinput Dinput-md Djoin-item max-w-xs ring-1 ring-secondary focus:ring-2 focus:ring-primary"
							type="text"
							bind:value={youtubeUrl}
							placeholder="Enter youtube URL link"
						/>
						<button
							id="youtube-input"
							class="Dbtn Djoin-item Dbtn-md"
							type="submit"
							bind:this={youtubeInput}>Load Visualizer</button
						>
					</form>
				{/if}
			</div>
			<div class="Djoin mt-4 space-x-2">
				<button class="Dbtn Dbtn-primary Djoin-item Dbtn-sm" on:click={() => switchMode('mp3')}
					>MP3</button
				>
				<button
					class="Dbtn Dbtn-secondary Djoin-item Dbtn-sm"
					on:click={() => switchMode('youtube')}>YouTube</button
				>
			</div>
		</div>
	</div>
	<div id="container" class="visualizer-container z-[1]"></div>
</main>

<style>
	.visualizer-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.content-wrapper {
		width: 100%;
		height: 100%;
	}
	audio {
		width: 330px;
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
