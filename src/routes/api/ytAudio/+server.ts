import ytdl from 'ytdl-core';

//GET REQUEST
export async function GET(event): Promise<Response> {
	const videoUrl = event.url.searchParams.get('url');
	if (!videoUrl) {
		return new Response('No video url provided', { status: 400 });
	}

	try {
		const audioStream = ytdl(videoUrl, { filter: 'audioonly' });
		return new Response(audioStream, {
			headers: {
				'Content-Type': 'audio/mp4'
			}
		});
	} catch (error) {
		console.error(error);
		return new Response('Error fetching audio stream', { status: 500 });
	}
}
