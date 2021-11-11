import { createElement, removeElementbyId, createImage, loadJS } from './dom';
import close from '../assets/close.svg';

async function getStories(): Promise<string[]> {
    const script = document.getElementById('storyflow-script');
    const user = script?.getAttribute("data-storyflow-user") || 'c9477f1b-ab00-40f9-8bd5-fe590fff1ddd';
    const stories = await fetch(`https://storyflow.video/api/stories/${user}`);
    return await stories.json();
};

const template = document.createElement('template');
template.innerHTML = `
        <style>
            #storyflow-widget {
                display: block;
                width: 100%;
                height: 100%;
                z-index: 99999;
            }
            #video {
                position: fixed;
                cursor: pointer;
                padding: 1px;
                margin: 10px;
                box-shadow: 0px 8px 20px 0px;
                border-radius: 50%;
                border-style: solid;
                border-width: 2px;
                border-color: #ff7e1d;
                background-color: white;
                object-fit: cover;
                bottom: 0;
                left: 2;
            }
            #overlay {
                display: none;
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }
        </style>
        <div id="storyflow-widget">
            <video
                id="video"
                height="60"
                width="60"
                autoplay muted>
            </video>
        </div>
`;

function createOverlay(videos: string[]): HTMLDivElement {
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
function openStories(videos: string[], target: ShadowRoot): void {
    if (target.getElementById('overlay')) {
        return;
    }
    removeElementbyId('overlay');
    const overlay = createOverlay(videos);
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
    target.appendChild(overlay);
}

export default class StoryflowWidget extends HTMLElement {
    constructor() {
        super();
        let videos: string[] = [];
        this.attachShadow({ mode: 'open' });
        if (this.shadowRoot) {
            this.shadowRoot.appendChild(template.content.cloneNode(true));
            loadJS('https://cdn.ampproject.org/v0.js', this.shadowRoot);
            loadJS('https://cdn.ampproject.org/v0/amp-story-1.0.js', this.shadowRoot);
            loadJS('https://cdn.ampproject.org/v0/amp-video-0.1.js', this.shadowRoot);
        }

        getStories()
            .then((res: any) => {
                videos = res.map(({ url }: any) => url);
                // add first video as src
                const videoEl = <HTMLVideoElement>this.shadowRoot?.getElementById('video');
                videoEl.src = videos[0];

                // handle click event to open stories
                // this.shadowRoot?.appendChild(overlay);
                videoEl.addEventListener('click', () => {
                    // overlay.style.display = 'block';
                    this.shadowRoot && openStories(videos, this.shadowRoot);
                });

                // // generate amp story pages
                // const storyPages = videos.map((video, index) => `
                //     <amp-story-page id="${index}">
                //         <amp-story-grid-layer template="fill">
                //             <amp-video
                //                 layout="responsive"
                //                 src="${video}"
                //                 height="480"
                //                 width="270"
                //                 autoplay>
                //             </amp-video>
                //         </amp-story-grid-layer>
                //     </amp-story-page>
                // `);

                // // add amp story pages to amp story
                // overlay.innerHTML = `
                //     <amp-story standalone
                //         title="Storyflow AMP"
                //         publisher="Storyflow">
                //         ${storyPages.join('')}
                //     </amp-story>
                // `;
            })
            .catch(err => console.log(err));
    }
}


