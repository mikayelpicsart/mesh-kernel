import { getLibrary } from '../helpers/pi';

const sessions = [];
let currentSessionIndex = 0;

export async function setNewSession(canvas = document.createElement('canvas')) {
    const pi = await getLibrary();
    pi.canvas = canvas;
    const session = new pi.GLSession(500);
    session.accessGraph(() => {
        const size = pi.graph.value.Point2i();
        const graphOutPut = pi.graph.value.Image_ARGB_8888();
        const background = pi.graph.value.Image_ARGB_8888();
        const view = pi.graph.undocumented.RXImageView({
            value: graphOutPut,
            background,
            size: size,
            name: 'ImageView'
        });
        currentSessionIndex = sessions.push({ pi, session, view, size, graphOutPut, background }) - 1;
    })
}

export function accessToCanvas(callback, numberOfCanvas) {
    currentSessionIndex = numberOfCanvas;
    callback();
    currentSessionIndex = 0;
}

export class Layer {
    constructor() {
        this._projectionMatrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
        this._modelMatrix = [
            0.5, 0, 0, 0,
            0, 0.5, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
        this._bufferProjectionMatrix = new this._pi.core.BufferFloat(this._projectionMatrix);
        this._bufferModelMatrix = new this._pi.core.BufferFloat(this._modelMatrix);
        this._session.accessGraph(() => {
            
            this.input = this._pi.graph.value.Image_ARGB_8888();
            this.image = this._pi.graph.value.Image_ARGB_8888();
            // this._projectionMatrix = this._pi.graph.geometry.MakeOrthoProjectionMatrix({
            //     left: this._pi.graph.value.Float(0.),
            //     right: this._pi.graph.value.Float(0.),
            //     bottom: this._pi.graph.value.Float(0.),
            //     top: this._pi.graph.value.Float(0.)
            // });
            this.output = this._pi.graph.rendering.Mesh({
                input: this._pi.graph.basic_operations.Copy({ input: this.input }),
                image: this.image,
                //blend_mode: this._pi.graph.value.Int(1),
                model_matrix: this._pi.graph.value.Buffer_Float(this._bufferModelMatrix),
                projection_matrix: this._pi.graph.value.Buffer_Float(this._bufferProjectionMatrix)
            });
        });
    }
    setInput(buffer) {
        this._session.accessGraph(() => {
            const image = this._pi.core.ImageARGB8.create(buffer);
            this._pi.canvas.width = image.width;
            this._pi.canvas.height = image.height;
            this._size.value = this._pi.graph.value.Point2i();
            this.input.value = image;
            //image.delete();
        });
    }
    /**
     * @param {Layer} layer 
     */
    // link(layer) {
    //     this._session.accessGraph(() => {
    //         this.image = layer.output
    //     });
    // }
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
    get _graphOutPut() {
        return sessions[currentSessionIndex].graphOutPut;
    }
    set _graphOutPut(graphOutPut) {
        return sessions[currentSessionIndex].graphOutPut = graphOutPut;
    }
    render() {
        this._session.accessGraph(() => {        
            this._view.output.node().setInput('value', this.output);
            console.log(this._view.output);
            this._session.runValue(this._view.output);
        });
    }
}