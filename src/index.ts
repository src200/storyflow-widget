import { createElement, removeElementbyId, loadJS, createImage, loadCSS } from './dom';
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

function getUserId(): string {
    const script = document.getElementById('storyflow-script');
    return script?.getAttribute("data-storyflow-user") || 'c9477f1b-ab00-40f9-8bd5-fe590fff1ddd';
}

async function getStories(): Promise<string[]> {
    const stories = await fetch(`https://storyflow.video/api/stories/${getUserId()}`);
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
        // backgroundColor: '#F7EDDF',
        animation: 'pulse 1s infinite',
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
    // merge stories with preview link
    storyPlayerLinks.push({
        name: 'Storyflow',
        description: 'Storyflow',
        type: 'amp-story',
        url: `https://f002.backblazeb2.com/file/storyflow/${getUserId()}.html`,
        media_id: '',
        user_id: getUserId()
    });
    console.log(storyPlayerLinks);
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
            zIndex: 3
        },
        innerHTML: `
            <amp-story-player layout="fill" >
                ${storyPlayerLinks.map(stories => `
                    <a href="${stories.url}"></a>
                `).join('')}
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
    }, 0);
}

// start from here
function init(): void {
    setTimeout(() => {
        if (iframe.contentWindow) {
            loadJS('https://cdn.ampproject.org/v0.js', iframe.contentWindow.document);
            loadJS('https://cdn.ampproject.org/v0/amp-story-player-0.1.js', iframe.contentWindow.document);
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