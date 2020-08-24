import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { getLibrary } from '../helpers/pi';
import { getBufferFromFile, getBufferFromUrl } from '../helpers';
import { multiplyMatrix, multiplyMatrix4X4, Transpose4x4 } from '../helpers/matrix';



function App() {

  const pi = useMemo(() => getLibrary(), []);
  //console.log(pi);
  const canvasRef = useRef(null);
  const transformRef = useRef(null);
  const [session, setSession] = useState(null);
  const [input1, setInput1] = useState(null);
  const [input2, setInput2] = useState(null);
  const [cord, setCord] = useState(null);
  const [customTransform, setTransform] = useState(null);
  const [size, setSize] = useState(null);
  const [ivOut, setOutput] = useState(null);
  const [indexTest, setIndexTest] = useState(0);
  const [projectionMatrixValueKernel, setProjectionValueKernel] = useState(null);
  

  useEffect(() => {
    (async function () {
      const width = 512, height = 512;
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      pi.canvas = canvasRef.current;
      const session = new pi.GLSession(500);
      session.accessGraph(() => {
        const input1 = pi.graph.value.Image_ARGB_8888();
        // const bw = pi.graph.filters.BlackAndWhite(input1);
        // const bwCache = pi.graph.value.Image_ARGB_8888(bw);
        const input1Copy = pi.graph.basic_operations.Copy({ input: input1 });
        // const shape = pi.graph.basic_operations.ShapeOf(input1Copy);
        // const projectionMatrix = pi.graph.geometry.MakeOrthoProjectionMatrix({
        //     left: pi.graph.value.Float(0.),
        //     right: pi.graph.value.Float(30.),
        //     bottom: pi.graph.value.Float(-2.),
        //     top: pi.graph.value.Float(0.)
        // });
        // const transformMatrixData = {
        //   sX: pi.graph.value.Float(1.), sY: pi.graph.value.Float(1.), sZ: pi.graph.value.Float(1.),  // scaling
        //   tX: pi.graph.value.Float(0.), tY: pi.graph.value.Float(0.), tZ: pi.graph.value.Float(0.),  // rotation 
        //   rX: pi.graph.value.Float(0.), rY: pi.graph.value.Float(0.), rZ: pi.graph.value.Float(0.),  // translation.
        // };
        const transformCurrentMatrix = [
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
        ];
        const bufferFloat = new pi.core.BufferFloat(transformCurrentMatrix);
        const bufferFloatProjection = new pi.core.BufferFloat([
          0.5, 0.0, 0.0, 0.0,
          0.0, 0.5, 0.0, 0.0,
          0.0, 0.0, 1, 0.0,
          0, 0.0, 0.0, 1
        ]);
        const transformMatrix = pi.graph.value.Buffer_Float(bufferFloat);
        const projectionMatrix = pi.graph.value.Buffer_Float(bufferFloatProjection);
        bufferFloat.delete();
        const input2 = pi.graph.value.Image_ARGB_8888();
        // const logTransformMatrixData = pi.graph.basic_operations.Log(transformMatrix);
        // const logProjectionMatrix = pi.graph.basic_operations.Log(projectionMatrix);
        const mesh = pi.graph.rendering.Mesh({
          input: input1Copy,
          image: input2,
          disable_culling: pi.graph.value.Int(0),
          // blend_mode: pi.graph.value.Int(1),
          model_matrix: transformMatrix,
          projection_matrix: projectionMatrix
        });

        const size = pi.graph.value.Point2i();
        const view = pi.graph.undocumented.RXImageView({ value: mesh, background: pi.graph.value.Image_ARGB_8888(), size: size, name: 'ImageView' });
        unstable_batchedUpdates(() => {
          setSession(session);
          setTransform(transformCurrentMatrix);
          setSize(size)
          setInput1(input1);
          setInput2(input2);
          setCord(transformMatrix);
          setProjectionValueKernel(projectionMatrix);
          setOutput(view);
        })
      });
    })()
  }, [pi]);
  const handlerChange = useCallback((e) => {
    const { value, name } = e.target;
    const newValue = parseFloat(value);
    const transform = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
    switch (name[0]) {
      case 's':
        switch (name[1]) {
          case 'X':
            transform[0] = newValue / 100;
            break;
          case 'Y':
            transform[5] = newValue / 100;
            break;
          case 'Z':
            transform[10] = newValue / 100;
            break;
          default:
            break;
        }
        break;
      case 'r':
        switch (name[1]) {
          case 'X':
            transform[5] = Math.cos(newValue * 2 * Math.PI / 100);
            transform[6] = - Math.sin(newValue * 2 * Math.PI / 100);
            transform[9] = - transform[6];
            transform[10] = transform[5];
            break;
          case 'Y':
            transform[0] = Math.cos(newValue * 2 * Math.PI / 100);
            transform[2] = Math.sin(newValue * 2 * Math.PI / 100);
            transform[8] = - transform[2];
            transform[10] = transform[0];
            break;
          case 'Z':
            transform[0] = Math.cos(newValue * 2 * Math.PI / 100);
            transform[1] = - Math.sin(newValue * 2 * Math.PI / 100);
            transform[4] = - transform[1];
            transform[5] = transform[0];
            break;
          default:
            break;
        }
        break;
      case 't':
        switch (name[1]) {
          case 'X':
            transform[3] = (newValue - 345);
            break;
          case 'Y':
            transform[7] = (newValue - 455);
            break;
          case 'Z':
            transform[11] = (newValue - 50);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }

    session.accessGraph(() => {
      const newMatrix = multiplyMatrix4X4(transform, customTransform);
      //setTransform(newMatrix);
      console.log(newMatrix);
      transformRef.current.style.transform = ` matrix3d(${Transpose4x4(newMatrix)}) `
      const bufferFloat = new pi.core.BufferFloat(Transpose4x4(newMatrix));
      cord.value = bufferFloat;
      bufferFloat.delete();
      session.runValue(ivOut.output);
    });
  }, [cord, ivOut, pi.core.BufferFloat, session, customTransform]);


  const testHandler = useCallback((e) => {
    const { value } = e.target;
    const newValue = parseFloat(value);
    session.accessGraph(() => {
      const testmatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ];
      testmatrix[indexTest] = newValue;
      const bufferFloat = new pi.core.BufferFloat(testmatrix);
      projectionMatrixValueKernel.value = bufferFloat;
      bufferFloat.delete();
      session.runValue(ivOut.output);
    });
  }, [session, indexTest, pi.core.BufferFloat, projectionMatrixValueKernel, ivOut]);

  const handlerClick = useCallback(async () => {
    const buffer = await getBufferFromUrl("https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS1WrD1iVGqDF5IAL8M-eyg9gKTLkxsuzEYzg&usqp=CAU");
    const projectionMatrixLocal = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
    session.accessGraph(() => {
      console.log();
      const img = pi.core.ImageARGB8.create(buffer);
      input2.value = img;
      projectionMatrixLocal[0] = img.width / size.value.x;
      projectionMatrixLocal[5] = img.height / size.value.y;
      const bufferFloat = new pi.core.BufferFloat(projectionMatrixLocal);
      projectionMatrixValueKernel.value = bufferFloat;
      bufferFloat.delete();
      img.delete();
      session.runValue(ivOut.output);
    });
  }, [input2, ivOut, pi, session, size, projectionMatrixValueKernel]);
  const handlerFile = useCallback(async (e) => {
    const [file] = e.target.files;
    if (!file) return;
    const buffer = await getBufferFromFile(file);
    const img = pi.core.ImageARGB8.create(buffer);
    const width = img.width;
    const height = img.height;
    session.accessGraph(() => {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      size.value = new pi.core.Point2i(width, height);
      input1.value = img
      img.delete();
      session.runValue(ivOut.output);
    });
  }, [pi, session, size, input1, ivOut])
  return (
    <div>
      <div className='canvasWarper' >
        <div>
          <div><input type='file' accept="image/png, image/jpeg" onChange={handlerFile} /></div>
          <div><input type='range' min='0' max='100' name='sX' defaultValue={100} onChange={handlerChange} /> <span>ScaleX </span> </div>
          <div><input type='range' min='0' max='100' name='sY' defaultValue={100} onChange={handlerChange} /> <span>ScaleY </span> </div>
          <div><input type='range' min='0' max='100' name='sZ' defaultValue={100} onChange={handlerChange} /> <span>ScaleZ </span> </div>
          <div><input type='range' min='0' max='100' name='rX' onChange={handlerChange} /> <span>RotateX </span> </div>
          <div><input type='range' min='0' max='100' name='rY' onChange={handlerChange} /> <span>RotateY </span> </div>
          <div><input type='range' min='0' max='100' name='rZ' onChange={handlerChange} /> <span>RotateZ </span> </div>
          <div><input type='range' min='0' max='690' name='tX' onChange={handlerChange} /> <span>TranslateX </span> </div>
          <div><input type='range' min='0' max='910' name='tY' onChange={handlerChange} /> <span>TranslateY </span> </div>
          <div><input type='range' min='0' max='100' name='tZ' onChange={handlerChange} /> <span>TranslateZ </span> </div>

{/* 
          <div><input type='number' value={indexTest} onChange={(e) => {
            setIndexTest( +e.target.value);
          }} /><input type='number' onChange={testHandler} /> <span>testHandler </span> </div> */}
          
          <div> <button type='button' onClick={handlerClick} > Add Sticker </button></div>
        </div>
        <div style={{position: 'relative'}} >
          <div ref={transformRef} style={{position: 'absolute', width: '50px', height: '50px', border: '1px solid black'}} />
          <canvas ref={canvasRef} /></div>
      </div>
    </div>
  );
}

export default App;