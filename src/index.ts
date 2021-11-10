import { createElement, removeElementbyId, loadJS, createImage } from './dom';
import close from '../assets/close.svg';

// const sampleVideos = [
//     'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-1240-large.mp4',
//     'https://assets.mixkit.co/videos/preview/mixkit-man-under-multicolored-lights-1237-large.mp4',
//     'https://assets.mixkit.co/videos/preview/mixkit-a-man-doing-jumping-tricks-at-the-beach-1222-large.mp4',
//     'https://assets.mixkit.co/videos/preview/mixkit-man-holding-neon-light-1238-large.mp4'
// ]

let videos: string[] = [];

async function getStories(): Promise<string[]> {
    const script = document.getElementById('storyflow-script');
    const user = script?.getAttribute("data-storyflow-user") || 'c9477f1b-ab00-40f9-8bd5-fe590fff1ddd';
    const stories = await fetch(`https://storyflow.video/api/stories/${user}`);
    return await stories.json();
};

// create globalWrapper div
const globalWrapper = <HTMLDivElement>createElement({
    attributes: {
        class: 'globalWrapper'
    }
});

// create overlay
function createOverlay(): HTMLDivElement {
    const overlayContainer = <HTMLDivElement>createElement({
        attributes: {
            class: 'overlay',
            id: 'overlay'
        },
        styles: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            minHeight: '480px',
            minWidth: '270px',
            zIndex: 3
        },
        innerHTML: `
        <amp-story standalone
            title="Storyflow AMP"
            publisher="Storyflow">
            ${videos.map((video, index) => `
                <amp-story-page id="${index}">
                    <amp-story-grid-layer template="fill">
                        <amp-video
                            layout="responsive"
                            src="${video}"
                            height="480"
                            width="270"
                            autoplay>
                        </amp-video>
                    </amp-story-grid-layer>
                </amp-story-page>`
        )} 
        </amp-story>
        `
    });

    return overlayContainer;
}

// play stories
function openStories(): void {
    if (document.getElementById('overlay')) {
        return;
    }
    removeElementbyId('overlay');
    const overlay = createOverlay();

    const commonBtnProps = {
        styles: {
            height: '38px',
            width: '38px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }
    }

    const closeBtn = <HTMLButtonElement>createElement({
        attributes: {
            id: 'closeBtn'
        },
        styles: {
            ...commonBtnProps.styles,
            position: 'absolute',
            margin: '10px',
            top: 2,
            right: 0
        },
        eventHandlers: {
            click: (e: MouseEvent) => {
                removeElementbyId('overlay');
            }
        }
    });
    closeBtn.appendChild(createImage(close));
    overlay.appendChild(closeBtn);
    globalWrapper.appendChild(overlay);
}

// start from here
function init(): void {
    const videoWrapper = <HTMLDivElement>createElement({
        attributes: {
            id: 'videoWrapper'
        },
        styles: {
            position: 'fixed',
            bottom: 0,
            left: 0
        }
    });

    // create video element on load
    const video = <HTMLVideoElement>createElement({
        type: 'video',
        styles: {
            position: 'relative',
            cursor: 'pointer',
            padding: '1px',
            margin: '10px',
            boxShadow: '0px 8px 20px 0px',
            borderRadius: '50%',
            borderStyle: 'solid',
            borderWidth: '2px',
            borderColor: '#ff7e1d',
            backgroundColor: 'white',
            objectFit: 'cover',
            bottom: 0,
            left: 2
        },
        attributes: {
            id: 'video',
            src: videos[0],
            height: '60',
            width: '60'
        },
        eventHandlers: {
            click: (e: MouseEvent) => {
                openStories();
            }
        }
    });
    video.autoplay = true;
    video.muted = true;
    video.onloadedmetadata = e => video.play();
    videoWrapper.appendChild(video);
    globalWrapper.appendChild(videoWrapper);

    // finally append it to body
    document.body.appendChild(globalWrapper);
}

// onload init
window.addEventListener('load', function () {
    // make the globalWrapper draggable
    // dragElement(globalWrapper);

    loadJS('https://cdn.ampproject.org/v0.js');
    loadJS('https://cdn.ampproject.org/v0/amp-story-1.0.js');
    loadJS('https://cdn.ampproject.org/v0/amp-video-0.1.js');

    // create videos
    getStories()
        .then((res: any) => {
            videos = res.map(({ url }: any) => url);
            init();
        })
        .catch(err => console.log(err));
});