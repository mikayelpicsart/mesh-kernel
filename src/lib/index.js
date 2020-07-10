import { getLibrary } from '../helpers/pi';

const sessions = [];
let currentSessionIndex = 0;

export async function setNewSession(canvas = document.createElement('canvas')) {
    const pi = await getLibrary();
    pi.canvas = canvas;
    const session = new pi.GLSession(500);
    session.accessGraph(() => {
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
    })
}

export class Layer {
    constructor() {
        this._session.accessGraph(() => {
            this.input = this._pi.graph.value.Image_ARGB_8888();
            this.image = this._pi.graph.value.Image_ARGB_8888();
            this.output = this._pi.graph.rendering.Mesh({
                input: this.input,
                image: this.image,
                blend_mode: this._pi.graph.value.Int(1),
                // model_matrix: transformMatrix,
                // projection_matrix: logProjectionMatrix
            });
        });
    }
    setInput(buffer) {
        this._session.accessGraph(() => {
            this.input.value = this._pi.core.ImageARGB8.create(buffer);
        });
    }
    get _session() {
        return sessions[currentSessionIndex].session;
    }
    get _view() {
        return sessions[currentSessionIndex].view;
    }
    get _pi() {
        return sessions[currentSessionIndex].pi;
    }
    get _size() {
        return sessions[currentSessionIndex].size;
    }
    render() {
        this._session.accessGraph(() => {
            console.log(this._view)
            this._session.runValue(this._view.output);
        });
    }
}