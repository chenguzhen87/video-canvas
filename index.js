import {frameIntervalometer} from 'intervalometer';

export default (video, opts = {}) => {
	const canvas = opts.canvas || document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	const drawCall = opts.drawCall || function () {
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
	};

	if (opts.updateSize !== false) {
		const updateSize = () => {
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
		};

		video.addEventListener('loadedmetadata', updateSize);
		updateSize();
	}

	const updater = frameIntervalometer(() => drawCall(ctx, video));

	// 'playing' is consistently fired when the video resumes playing
	// after a pause, a stall, or a seek.
	video.addEventListener('playing', updater.start);

	// 'pause' is fired after a .pause(), on 'ended', or on 'seeking'.
	video.addEventListener('pause', updater.stop);

	// 'abort', 'error' and 'waiting' are network-related.
	video.addEventListener('abort', updater.stop);
	video.addEventListener('error', updater.stop);
	video.addEventListener('waiting', updater.stop);

	if (!video.paused) {
		updater.start();
	}

	return canvas;
};
