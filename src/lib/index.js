import { getLibrary } from '../helpers/pi';
import { identityMatrix4x4, zeroMatrix4x4, multiplyMatrix4X4 } from '../helpers/matrix';

const sessions = [];
let currentSessionIndex = 0;

export async function setNewSession(canvas = document.createElement('canvas')) {
    const pi = await getLibrary();
    pi.canvas = canvas;
    const session = new pi.GLSession(500);
    session.accessGraph(() => {
        const view = pi.graph.undocumented.RXImageView({
            value: pi.graph.value.Image_ARGB_8888(),
            background: pi.graph.value.Image_ARGB_8888(),
            size: pi.graph.value.Point2i(),
            name: 'ImageView'
        });
        currentSessionIndex = sessions.push({ pi, session, view }) - 1;
    })
}

export function accessToCanvas(callback, numberOfCanvas) {
    currentSessionIndex = numberOfCanvas;
    callback();
    currentSessionIndex = 0;
}

export class Layer {
    constructor() {
        this._model = {
            'scaleX': 1,
            'scaleY': 1,
            'rotateX': 0,
            'rotateY': 0,
            'rotateZ': 0,
            'translationX': 0,
            'translationY': 0
        }
       
        this._modelMatrix = identityMatrix4x4;
        this.width = 0; this.height = 0;
        const projectionMatrix = zeroMatrix4x4;
        const bufferProjectionMatrix = new this._pi.core.BufferFloat(projectionMatrix);
        const bufferModelMatrix = new this._pi.core.BufferFloat(this._modelMatrix);
        this._session.accessGraph(() => {
            this.input = this._pi.graph.value.Image_ARGB_8888();
            this._modelMatrixValue = this._pi.graph.value.Buffer_Float(bufferModelMatrix);
            this.output = this._pi.graph.rendering.Mesh({
                input: this._pi.graph.basic_operations.Copy({ input: this.input }),
                image: this._pi.graph.value.Image_ARGB_8888(),
                model_matrix: this._modelMatrixValue,
                projection_matrix: this._pi.graph.value.Buffer_Float(bufferProjectionMatrix)
            });
        });
    }
    setInput(buffer) {
        this._session.accessGraph(() => {
            const image = this._pi.core.ImageARGB8.create(buffer);
            this.width = image.width;
            this.height = image.height;
            this.input.value = image;
            image.delete();
        });
    }
    /**
     * @param {Layer} layer 
     */
    add(layer) {
        this._session.accessGraph(() => {
            const projectionMatrix = this._pi.graph.geometry.MakeOrthoProjectionMatrix({
                left: this._pi.graph.value.Float(-parseFloat((this.width - layer.width) / 2)),
                right: this._pi.graph.value.Float(parseFloat((this.width - layer.width) / 2)),
                bottom: this._pi.graph.value.Float(-parseFloat((this.height - layer.height) / 2)),
                top: this._pi.graph.value.Float(parseFloat((this.height - layer.height) / 2))
            });
            const vertices = [
                -layer.width/2, -layer.height/2, 0.0,
                layer.width/2,  -layer.height/2, 0.0,
                -layer.width/2, layer.height/2, 0.0,
                layer.width/2, layer.height/2, 0.0 
            ]
            const verticesBuffer = new this._pi.core.BufferFloat(vertices)
            this.output.node().setInput('projection_matrix', projectionMatrix);
            this.output.node().setInput('image', layer.output);
            this.output.node().setInput('verticies', this._pi.graph.value.Buffer_Float(verticesBuffer));
        });
    }
    updateModelMatrix() {
        
        multiplyMatrix4X4(,identityMatrix4x4)
        // this._session.accessGraph(() => {
        //     const modelMatrix = []
        //     this._modelMatrix
        // });
    }
    get scaleX () {
        return this._model['scaleX'];
    }
    get scaleY () {
        return this._model['scaleX'];
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
    render() {
        this._pi.canvas.width = this.width;
        this._pi.canvas.height = this.height;
        this._session.accessGraph(() => {
            this._view.output.node().setInput('value', this.output);
            this._view.output.node().setInput('size', this._pi.graph.basic_operations.ShapeOf(this.output).size);
            this._session.runValue(this._view.output);
        });
    }
}