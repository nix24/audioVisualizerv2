export const GET = async (event) => {
	const thumbnailURL = event.url.searchParams.get('url');

	if (!thumbnailURL) {
		return new Response('No thumbnail URL provided', { status: 400 });
	}

	const res = await fetch(thumbnailURL);
	const blob = await res.blob();

	return new Response(blob, {
		headers: {
			'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
			'Access-Control-Allow-Origin': '*'
		}
	});
};
