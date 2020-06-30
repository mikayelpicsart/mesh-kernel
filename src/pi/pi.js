let library = null;

class FactoryMethod {
    constructor(kernelName) {
        this.kernelName = kernelName;
        this.kernels = [];
    }

    addKernel(kernel) {
        this.kernels.push(kernel);
    }

    createNode() {
        if (this.kernelName in library.Type) {
            // Value kernel
            const kernel = this.kernels[0];
            const args = this._valueNodeArgs(arguments);
            const inputType = library.Type.values[kernel.inputs[0].type];
            let nodeName = args.name;
            if (nodeName == null) {
                nodeName = Error().stack.split('\n')[2].trim().substr(3);
            }
            const node = library.valueNode(nodeName, inputType, args.value, args.device);
            const outputTypeIdx = kernel.outputs[0].type;
            const outputType = library.Type.values[outputTypeIdx];
            const vv = node._output('value', outputType);
            const v = library._valueMap[outputTypeIdx]._cast(vv);
            if (args.initValue) {
                v.value = args.initValue;
            }
            node.delete();
            vv.delete();
            return v;
        }
        const args = this._nodeArgs(arguments);
        let nodeName = args.name;
        if (nodeName == null) {
            nodeName = Error().stack.split('\n')[2].trim().substr(3);
        }
        const node = library.node(nodeName, this.kernelName, args.inputs, args.device);
        const outputs = args.kernel.outputs;
        if (outputs.length === 0) {
            throw new Error("No outputs?");
        }
        let outputValues = {};
        for (let i = 0; i < outputs.length; ++i) {
            const outputTypeIdx = args.kernel.outputs[i].type;
            const outputType = library.Type.values[outputTypeIdx];
            const vv = node._output(outputs[i].name, outputType);
            outputValues[outputs[i].name] = library._virtualMap[outputTypeIdx]._cast(vv);
            vv.delete();
        }
        node.delete();
        if (outputs.length === 1) {
            return Object.values(outputValues)[0];
        }
        return outputValues;
    }

    _nodeArgs(args) {
        let name = null;
        let device = library.Device.Unspecified;
        let positionalArgs = [...args];
        if (positionalArgs.length > 0 && positionalArgs[positionalArgs.length - 1] instanceof library.Device) {
            device = positionalArgs.pop();
        }
        if (positionalArgs.length > 0 && typeof positionalArgs[positionalArgs.length - 1] == 'string') {
            name = positionalArgs.pop();
        }

        let dictArgs = null;
        if (positionalArgs.length > 0) {
            if (Object.keys(positionalArgs[positionalArgs.length - 1]).length > 0) {
                dictArgs = positionalArgs.pop();
            }
        }
        if (dictArgs) {
            if ('name' in dictArgs) {
                name = dictArgs.name;
                delete dictArgs.name;
            }
            if ('device' in dictArgs) {
                device = dictArgs.device;
                delete dictArgs.device;
            }
        }
        const kernel = this._selectKernel(positionalArgs, dictArgs, device);

        let inputsMap = new library.InputsMap();
        if (positionalArgs) {
            for (let i = 0; i < positionalArgs.length; ++i) {
                inputsMap.set(kernel.inputs[i].name, positionalArgs[i]);
            }
        }
        if (dictArgs) {
            for (let e in dictArgs) {
                inputsMap.set(e, dictArgs[e]);
            }
        }
        return {inputs: inputsMap, name: name, device: device, kernel: kernel};
    }

    _selectKernel(positionalArgs, dictArgs, device) {
        const CPUKernel = 1 << 6;
        const GLKernel = 1 << 12;
        let matchedKernels = [];
        for (let kIdx = 0; kIdx < this.kernels.length; ++kIdx) {
            const kernel = this.kernels[kIdx];
            let inputs = [...kernel.inputs];
            if (device === library.Device.CPU && (kernel.type & CPUKernel) === 0) {
                continue;
            }
            if (device === library.Device.GL && (kernel.type & GLKernel) === 0) {
                continue;
            }
            if (positionalArgs) {
                if (!this._matchPositionalArgs(inputs, positionalArgs)) {
                    continue;
                }
                inputs = inputs.slice(positionalArgs.length);
            }
            if (dictArgs) {
                if (!this._matchDictArgs(inputs, dictArgs)) {
                    continue;
                }
            } else if (inputs.length > 0) {
                if (!this._allOptional(inputs)) {
                    continue;
                }
            }
            // this kernel is a survivor
            matchedKernels.push(kernel);
        }

        if (matchedKernels.length === 0) {
            throw new Error("Can't find kernel candidate with the given inputs");
        }
        if (device === library.Device.Unspecified && matchedKernels.length === 2) {
            const bothFlags = CPUKernel | GLKernel;
            const k1 = matchedKernels[0].type & bothFlags;
            const k2 = matchedKernels[1].type & bothFlags;
            if (k1 !== k2) {
                // If we ended up with CPU and GL overloads of the same kernel
                // go ahead, GL will be choosed during graph compilation
                return matchedKernels[0];
            }
        }
        if (matchedKernels.length > 1) {
            let kernelsStr = "";
            matchedKernels.forEach(kernel => {
                kernelsStr += kernel.toString() + '\n';
            });
            throw new Error("Found several kernel candidates:\n" + kernelsStr);
        }
        return matchedKernels[0];
    }

    _matchPositionalArgs(inputs, positionalArgs) {
        if (positionalArgs.length > inputs.length) {
            return false;
        }
        for (let i = 0; i < positionalArgs.length; ++i) {
            const inputType = library._virtualMap[inputs[i].type];
            if (!(positionalArgs[i] instanceof inputType)) {
                return false;
            }
        }
        return true;
    }

    _matchDictArgs(inputs, dictArgs) {
        const dictArgsCount = Object.keys(dictArgs).length;
        if (dictArgsCount > inputs.length) {
            return false;
        }
        let matchCount = 0;
        for (let i = 0; i < inputs.length; ++i) {
            if (inputs[i].name in dictArgs) {
                const inputType = library._virtualMap[inputs[i].type];
                if (!(dictArgs[inputs[i].name] instanceof inputType)) {
                    return false;
                }
                ++matchCount;
            } else if (!inputs[i].optional) {
                return false;
            }
        }
        return (matchCount === dictArgsCount);
    }

    _allOptional(inputs) {
        for (let i = 0; i < inputs.length; ++i) {
            if (!inputs[i].optional) {
                return false;
            }
        }
        return true;
    }

    _valueNodeArgs(args) {
        let value = null;
        let initValue = null;
        if (args.length > 0 && args[0] != null) {
            if (args[0] instanceof library.VirtualValue) {
                value = args[0];
            } else {
                initValue = args[0];
            }
        }
        const name = args.length > 1 ? args[1] : null;
        const device = args.length > 2 ? args[2] : library.Device.Unspecified;
        return {value: value, initValue: initValue, name: name, device: device};
    }
};

class KernelInfo {
    constructor(name, type, inputs, outputs) {
        this.name = name;
        this.type = type;
        this.inputs = inputs;
        this.outputs = outputs;
    }

    toString() {
        let result = this.name + '(';
        let first = true;
        this.inputs.forEach(input => {
            if (first) {
                first = false;
            } else {
                result += ', ';
            }
            if (input.optional) {
                result += '[';
            }
            result += input.name + ': ' + library._virtualNameMap[input.type];
            if (input.optional) {
                result += ']';
            }
        });
        result += '): ';
        if (this.outputs.length > 1) {
            result += '{';
        }
        first = true;
        this.outputs.forEach(output => {
            if (first) {
                first = false;
            } else {
                result += ', ';
            }
            result += output.name + ': ' + library._virtualNameMap[output.type];
        });
        if (this.outputs.length > 1) {
            result += '{';
        }
        return result;
    }
};

function _addValueMaps() {
    library._virtualMap = {
        0: undefined,
        1: library.VirtualValueInt,
        2: library.VirtualValueFloat,
        3: library.VirtualValuePoint2i,
        4: library.VirtualValuePoint2f,
        5: library.VirtualValueARGB8,
        6: library.VirtualValueRGB8,
        7: library.VirtualValueBuffer8,
        8: library.VirtualValueBufferInt,
        9: library.VirtualValueBufferFloat,
        10: library.VirtualValueBufferARGB8,
        11: library.VirtualValueBufferRGB8,
        12: library.VirtualValueBufferPoint2i,
        13: library.VirtualValueBufferPoint2f,
        14: library.VirtualValueImage8,
        15: library.VirtualValueImageFloat,
        16: library.VirtualValueImageARGB8,
        17: library.VirtualValueImageRGB8,
        18: library.VirtualValueImageLAB8,
        19: library.VirtualValueImageAlphaLAB8,
        20: library.VirtualValueString,
        21: library.VirtualValueLABf
    };
    library._valueMap = {
        0: undefined,
        1: library.ValueInt,
        2: library.ValueFloat,
        3: library.ValuePoint2i,
        4: library.ValuePoint2f,
        5: library.ValueARGB8,
        6: library.ValueRGB8,
        7: library.ValueBuffer8,
        8: library.ValueBufferInt,
        9: library.ValueBufferFloat,
        10: library.ValueBufferARGB8,
        11: library.ValueBufferRGB8,
        12: library.ValueBufferPoint2i,
        13: library.ValueBufferPoint2f,
        14: library.ValueImage8,
        15: library.ValueImageFloat,
        16: library.ValueImageARGB8,
        17: library.ValueImageRGB8,
        18: library.ValueImageLAB8,
        19: library.ValueImageAlphaLAB8,
        20: library.ValueString,
        21: library.ValueLABf
    };
    library._virtualNameMap = {
        0: "Undefined",
        1: "VirtualValueInt",
        2: "VirtualValueFloat",
        3: "VirtualValuePoint2i",
        4: "VirtualValuePoint2f",
        5: "VirtualValueARGB8",
        6: "VirtualValueRGB8",
        7: "VirtualValueBuffer8",
        8: "VirtualValueBufferInt",
        9: "VirtualValueBufferFloat",
        10: "VirtualValueBufferARGB8",
        11: "VirtualValueBufferRGB8",
        12: "VirtualValueBufferPoint2i",
        13: "VirtualValueBufferPoint2f",
        14: "VirtualValueImage8",
        15: "VirtualValueImageFloat",
        16: "VirtualValueImageARGB8",
        17: "VirtualValueImageRGB8",
        18: "VirtualValueImageLAB8",
        19: "VirtualValueImageAlphaLAB8",
        20: "VirtualValueString",
        21: "VirtualValueLABf"
    };
}

function _registerKernel(kernel) {
    const inputs = [];
    kernel.inputs.forEach(input => {
        inputs.push({name: input.name, type: input.type, optional: ("default" in input)});
    });
    const outputs = [];
    if (kernel.outputs) {
        kernel.outputs.forEach(output => {
            outputs.push({name: output.name, type: output.type});
        });
    }
    const kernelName = kernel.name;
    const kernelInfo = new KernelInfo(kernelName, kernel.type, inputs, outputs);

    let factory;
    if (kernelName in library._factoryMethods) {
        factory = library._factoryMethods[kernelName];
    } else {
        factory = new FactoryMethod(kernelName);
        library._factoryMethods[kernelName] = factory;
    }
    factory.addKernel(kernelInfo);
    library[kernelName] = factory.createNode.bind(factory);
}

function initializeFactory() {
    _addValueMaps();

    const factory = new library.Factory();
    const obj = JSON.parse(factory.asJson());

    library._factoryMethods = {};
    const kernels = obj['kernels'];
    kernels.forEach(kernel => {
        _registerKernel(kernel);
    });
}

function tuneSessionClass() {
    library.Session.prototype.accessGraph = function (functor) {
        try {
            library.SessionLock.lock(this);
            functor();
        } finally {
            library.SessionLock.unlock();
        }
    }
    const virtualToValue = [
        [library.VirtualValueInt, library.ValueInt],
        [library.VirtualValueFloat, library.ValueFloat],
        [library.VirtualValuePoint2i, library.ValuePoint2i],
        [library.VirtualValuePoint2f, library.ValuePoint2f],
        [library.VirtualValueARGB8, library.ValueARGB8],
        [library.VirtualValueRGB8, library.ValueRGB8],
        [library.VirtualValueBuffer8, library.ValueBuffer8],
        [library.VirtualValueBufferInt, library.ValueBufferInt],
        [library.VirtualValueBufferFloat, library.ValueBufferFloat],
        [library.VirtualValueBufferARGB8, library.ValueBufferARGB8],
        [library.VirtualValueBufferRGB8, library.ValueBufferRGB8],
        [library.VirtualValueBufferPoint2i, library.ValueBufferPoint2i],
        [library.VirtualValueBufferPoint2f, library.ValueBufferPoint2f],
        [library.VirtualValueImage8, library.ValueImage8],
        [library.VirtualValueImageFloat, library.ValueImageFloat],
        [library.VirtualValueImageARGB8, library.ValueImageARGB8],
        [library.VirtualValueImageRGB8, library.ValueImageRGB8],
        [library.VirtualValueImageLAB8, library.ValueImageLAB8],
        [library.VirtualValueImageAlphaLAB8, library.ValueImageAlphaLAB8],
        [library.VirtualValueString, library.ValueString],
        [library.VirtualValueLABf, library.ValueLABf]
    ];
    library.Session.prototype._origRunValue = library.Session.prototype.runValue;
    library.Session.prototype.runValue = function(value) {
        const vv = this._origRunValue(value);
        for (let i = 0; i < virtualToValue.length; ++i) {
            if (value instanceof virtualToValue[i][0]) {
                const v = virtualToValue[i][1]._cast(vv);
                vv.delete();
                return v;
            }
        }
        return vv;
    }
}

async function initializeLibrary() {
    const createPIModule = require('./wasm/pi.js');
    library = await createPIModule();

    initializeFactory();
    tuneSessionClass();

    return library;
}

function getLibrary() {
    return library;
}

exports.getLibrary = getLibrary;
exports.initializeLibrary = initializeLibrary;
