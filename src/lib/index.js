import { getLibrary } from '../helpers/pi';

const sessions = [];
let currentSessionIndex = 0;

export async function setNewSession(canvas = document.createElement('canvas')) {
    const pi = await getLibrary();
    pi.canvas = this.canvas;
    const session = new this.pi.GLSession(500);
    const size = pi.graph.value.Point2i();
    const sourceImage = pi.graph.value.Image_ARGB_8888();
    const background = pi.graph.value.Image_ARGB_8888();
    const view = pi.graph.undocumented.RXImageView({
        value: sourceImage,
        background,
        size: size,
        name: 'ImageView'
    });
    currentSessionIndex = sessions.push({ pi, session, view, size, sourceImage, background }) - 1;
}

export class Layer {

    

    get session() {
        if (this.log.length === 0) {
            return undefined;
        }
        return this.log[this.log.length - 1];
    }
}