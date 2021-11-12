import { createElement, removeElementbyId, loadJS, createImage } from './dom';
import close from '../assets/close.svg';

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

const iframe = <HTMLIFrameElement>createElement({
    type: 'iframe',
    attributes: {
        id: 'storyflow-iframe',
        name: 'storyflow-iframe',
        frameborder: '0',
        sandbox: ' allow-popups-to-escape-sandbox allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation'
    },
    styles: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: 99999

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
        <amp-story standalone supports-landscape
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
                iframe.contentWindow && iframe.contentWindow.document.getElementById('overlay')?.remove();
            }
        }
    });
    closeBtn.appendChild(createImage(close));
    overlay.appendChild(closeBtn);
    globalWrapper.appendChild(overlay);
    iframe.width = '100%';
    iframe.height = '100%';
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

    setTimeout(() => {
        if (iframe.contentWindow) {
            loadJS('https://cdn.ampproject.org/v0.js', iframe.contentWindow.document);
            loadJS('https://cdn.ampproject.org/v0/amp-story-1.0.js', iframe.contentWindow.document);
            loadJS('https://cdn.ampproject.org/v0/amp-video-0.1.js', iframe.contentWindow.document);
            console.log(iframe.contentWindow)
            // fix: https://groups.google.com/g/amphtml-discuss/c/88Kti6QNCLQ?pli=1
            iframe.contentWindow.document.write('<span></span>');
            iframe.contentWindow.document.body.appendChild(globalWrapper);
        }
    }, 0);
    // finally append it to body
    document.body.appendChild(iframe);
}

// onload init
window.addEventListener('load', function () {
    // create videos
    getStories()
        .then((res: any) => {
            videos = res.map(({ url }: any) => url);
            init();
        })
        .catch(err => console.log(err));
});