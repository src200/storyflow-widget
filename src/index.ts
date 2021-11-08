import { createElement, removeElementbyId, dragElement, createImage, disableBtn, enableBtn } from './dom';
import play from '../assets/play.svg';
import next from '../assets/next.svg';
import prev from '../assets/prev.svg';
import close from '../assets/close.svg';

const sampleVideos = [
    'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-1240-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-man-under-multicolored-lights-1237-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-a-man-doing-jumping-tricks-at-the-beach-1222-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-man-holding-neon-light-1238-large.mp4'
]

let videos: string[] = [];

async function getStories(): Promise<string[]> {
    const script = document.getElementById('storyflow-script');
    const user = script?.getAttribute("data-storyflow-user");
    const stories = await fetch(`https://storyflow.video/api/stories/${user}`);
    return await stories.json();
};

// create globalWrapper div
const globalWrapper = <HTMLDivElement>createElement({
    attributes: {
        class: 'globalWrapper'
    },
    styles: {
        position: 'fixed',
        zIndex: 99999,
        bottom: 0,
        left: 0
    }
});

function changeVideoSrc(video: HTMLVideoElement, index: number): void {
    if (videos.length >= index) {
        const videoWrapper = document.getElementById('video');
        video.src = videos[index];
        (videoWrapper as HTMLVideoElement).src = videos[index];
    }
}

// create video player
function createVideoPlayer(): HTMLVideoElement {
    const video = <HTMLVideoElement>createElement({
        type: 'video',
        attributes: {
            id: 'videoPlayer',
            src: videos[0],
            height: '480',
            width: '270'
        },
        styles: {
            objectFit: 'contain',
            borderRadius: '10px',
        },
        eventHandlers: {
            click: () => {
                if (video.paused) {
                    video.play();
                }
            }
        }
    });

    video.autoplay = true;
    video.muted = false;

    return video;
}

// create overlay
function createOverlay(): HTMLDivElement {
    const overlayContainer = <HTMLDivElement>createElement({
        attributes: {
            class: 'overlay',
            id: 'overlay'
        },
        styles: {
            position: 'fixed',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        }
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
    const player = createVideoPlayer();
    let currentIndex = 0;

    const videoPlayerWrapper = <HTMLDivElement>createElement({
        attributes: {
            id: 'videoPlayerWrapper',
            class: 'videoPlayerWrapper'
        },
        styles: {
            position: 'absolute',
            zIndex: 3,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)'
        }
    });

    const controlsWrapper = <HTMLDivElement>createElement({
        attributes: {
            id: 'controlsWrapper'
        },
        styles: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
        }
    });

    const commonBtnProps = {
        styles: {
            height: '32px',
            width: '32px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }
    }

    const prevBtn = <HTMLButtonElement>createElement({
        attributes: {
            id: 'prevBtn',
        },
        styles: {
            ...commonBtnProps.styles
        },
        eventHandlers: {
            click: (e: MouseEvent) => {
                if (currentIndex > 0) {
                    currentIndex--;
                    changeVideoSrc(player, currentIndex);
                    updateControls();
                }
            }
        }
    });
    prevBtn.appendChild(createImage(prev));

    const nextBtn = <HTMLButtonElement>createElement({
        attributes: {
            id: 'nextBtn',
        },
        styles: {
            ...commonBtnProps.styles
        },
        eventHandlers: {
            click: (e: MouseEvent) => {
                if (currentIndex < videos.length - 1) {
                    ++currentIndex;
                    changeVideoSrc(player, currentIndex);
                    updateControls();
                }
            }
        }
    });
    nextBtn.appendChild(createImage(next));

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
                init();
            }
        }
    });
    closeBtn.appendChild(createImage(close));

    // enable/disable prev and next btns
    function updateControls(): void {
        currentIndex <= 0 ? disableBtn(prevBtn) : enableBtn(prevBtn);
        currentIndex === videos.length - 1 ? disableBtn(nextBtn) : enableBtn(nextBtn);
    }
    updateControls();

    controlsWrapper.appendChild(prevBtn);
    controlsWrapper.appendChild(<HTMLVideoElement>document.getElementById('video'));
    controlsWrapper.appendChild(nextBtn);

    overlay.appendChild(videoPlayerWrapper);
    overlay.appendChild(closeBtn);
    videoPlayerWrapper.appendChild(player);
    videoPlayerWrapper.appendChild(controlsWrapper);
    globalWrapper.appendChild(overlay);
}

// start from here
function init(): void {
    const videoWrapper = <HTMLDivElement>createElement({
        attributes: {
            id: 'videoWrapper'
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

    // create videos
    getStories()
        .then((res: any) => {
            videos = res.map(({ url }: any) => url);
            init();
        })
        .catch(err => console.log(err));
});