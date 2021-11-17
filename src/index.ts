import { createElement, removeElementbyId, generateStoryExtensionMarkUp, loadJS, loadCSS, createImage } from './dom';
import close from '../assets/close.svg';
import storyflowImg from '../assets/storyflow.svg';

interface Media {
    name: string,
    description: string,
    type: string,
    url: string,
    media_id: string,
    user_id: string
};

let media: Media[] = [];

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
    },
    styles: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        cursor: 'pointer',
        width: '50px',
        height: '50px',
        padding: '1px',
        margin: '10px',
        boxShadow: '0px 8px 16px 0px',
        borderRadius: '50%',
        borderStyle: 'solid',
        borderWidth: '2px',
        borderColor: '#ff7e1d',
        backgroundColor: '#F7EDDF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    eventHandlers: {
        click: (e: MouseEvent) => {
            openStories();
        }
    }
});
globalWrapper.appendChild(createImage(storyflowImg));


const iframe = <HTMLIFrameElement>createElement({
    type: 'iframe',
    attributes: {
        id: 'storyflow-iframe',
        name: 'storyflow-iframe',
        frameborder: '0',
        sandbox: 'allow-presentation allow-popups-to-escape-sandbox allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation'
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
    const storyPlayerLinks = media.filter(m => m.type === 'amp-story');
    const storyExtensionsLinks = media.filter(m => m.type !== 'amp-story');
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
                ${storyExtensionsLinks.map((extensionStories, index) => `
                <amp-story-page id="${index}">
                    <amp-story-grid-layer template="fill">
                        ${generateStoryExtensionMarkUp(extensionStories)}
                    </amp-story-grid-layer>
                </amp-story-page>`)}
            </amp-story>
            <amp-story-player layout="fill">
                ${storyPlayerLinks.map(stories => generateStoryExtensionMarkUp(stories))}
            </amp-story-player>
            
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
            top: 0,
            left: 0,
            zIndex: 50
        },
        eventHandlers: {
            click: (e: MouseEvent) => {
                iframe.contentWindow && iframe.contentWindow.document.getElementById('overlay')?.remove();
                iframe.width = '';
                iframe.height = '';
            }
        }
    });

    closeBtn.appendChild(createImage(close));
    overlay.appendChild(closeBtn);
    setTimeout(() => {
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.contentWindow?.document.body.appendChild(overlay);
    }, 10);

    const playerEl = iframe.contentWindow?.document.querySelector('amp-story-player');
    playerEl?.addEventListener('ready', () => {
        console.log('Player is ready!!');
        // iframe.contentWindow?.document.body.appendChild(overlay);
    })


}

// start from here
function init(): void {
    setTimeout(() => {
        if (iframe.contentWindow) {
            loadJS('https://cdn.ampproject.org/v0.js', iframe.contentWindow.document);
            loadJS('https://cdn.ampproject.org/v0/amp-story-1.0.js', iframe.contentWindow.document);
            loadJS('https://cdn.ampproject.org/v0/amp-video-0.1.js', iframe.contentWindow.document);
            loadJS('https://cdn.ampproject.org/v0/amp-youtube-0.1.js', iframe.contentWindow.document);
            // loadCSS('https://cdn.ampproject.org/amp-story-player-0.1.css', iframe.contentWindow.document);
            loadJS('https://cdn.ampproject.org/v0/amp-story-player-0.1.js', iframe.contentWindow.document);
            loadJS('https://cdn.ampproject.org/v0/amp-carousel-0.1.js', iframe.contentWindow.document);
            // loadJS('https://cdn.ampproject.org/v0/amp-instagram-0.1.js', iframe.contentWindow.document);
            // loadJS('https://cdn.ampproject.org/v0/amp-twitter-0.1.js', iframe.contentWindow.document);
            // loadJS('https://cdn.ampproject.org/v0/amp-tiktok-0.1.js', iframe.contentWindow.document);

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
    getStories()
        .then((res: any) => {
            media = res;
            init();
        })
        .catch(err => console.log(err));
});