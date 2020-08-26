import { getLibrary } from '../helpers/pi';
import { identityMatrix4x4, zeroMatrix4x4, multiplyMatrix4X4, generateMatrix, Transpose4x4 } from '../helpers/matrix';

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
        this._modelMatrix = [...identityMatrix4x4];
        this.width = 0; this.height = 0;
        const projectionMatrix = [...zeroMatrix4x4];
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
    add(layer, { top = 0, left = 0 } = {}) {
        let cords = [
            (left / 100) * this.width,
            (1 - left / 100) * this.width,
            (top / 100) * this.height,
            (1 - top / 100) * this.height,
        ];
        console.log(cords, layer.width, layer.height, this.width, this.height);
        this._session.accessGraph(() => {
            const projectionMatrix = this._pi.graph.geometry.MakeOrthoProjectionMatrix({
                left: this._pi.graph.value.Float(-parseFloat(cords[0])),
                right: this._pi.graph.value.Float(parseFloat(cords[1])),
                top: this._pi.graph.value.Float(parseFloat(cords[2])),
                bottom: this._pi.graph.value.Float(-parseFloat(cords[3])),
            });
            const vertices = [
                -layer.width / 2, -layer.height / 2, 0.0,
                layer.width / 2, -layer.height / 2, 0.0,
                -layer.width / 2, layer.height / 2, 0.0,
                layer.width / 2, layer.height / 2, 0.0
            ]
            const verticesBuffer = new this._pi.core.BufferFloat(vertices);
            console.log(vertices);
            const projectionMatrixLog = this._pi.graph.basic_operations.Log(projectionMatrix);
            this.output.node().setInput('projection_matrix', projectionMatrixLog);
            this.output.node().setInput('image', layer.output);
            this.output.node().setInput('verticies', this._pi.graph.value.Buffer_Float(verticesBuffer));
        });
    }
    updateModelMatrix() {
        const scaleMatrix = generateMatrix('scale', this._model);
        const rotateMatrix = generateMatrix('rotate', this._model);
        const translationMatrix = generateMatrix('translation', this._model);
        const newModelMatrix = multiplyMatrix4X4(translationMatrix, multiplyMatrix4X4(rotateMatrix, scaleMatrix));
        this._modelMatrix = newModelMatrix;
        this._session.accessGraph(() => {
            this._modelMatrixValue.value = new this._pi.core.BufferFloat(Transpose4x4(this._modelMatrix));
        });
        console.log(this._modelMatrix);
    }
    get scaleX() {
        return this._model['scaleX'];
    }
    get scaleY() {
        return this._model['scaleY'];
    }
    set scaleX(value) {
        this._model['scaleX'] = value;
        this.updateModelMatrix();
        return this._model['scaleX'];
    }
    // eslint-disable-next-line no-dupe-class-members
    scaleX(value) {
        this._model['scaleX'] = value;
        this.updateModelMatrix();
        return this._model['scaleX'];
    }
    set scaleY(value) {
        this._model['scaleY'] = value;
        this.updateModelMatrix();
        return this._model['scaleY'];
    }
    // eslint-disable-next-line no-dupe-class-members
    scaleY(value) {
        this._model['scaleY'] = value;
        this.updateModelMatrix();
        return this._model['scaleY'];
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