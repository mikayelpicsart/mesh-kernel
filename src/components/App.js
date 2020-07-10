import React, { useEffect, useRef, useCallback } from 'react';
import { getBufferFromFile, getBufferFromUrl } from '../helpers';
import { Canvas } from '../lib';

function App() {
  const canvasRef = useRef(null);
  // const [session, setSession] = useState(null);
  // const [input1, setInput1] = useState(null);
  // const [input2, setInput2] = useState(null);
  // const [cord, setCord] = useState(null);
  // const [size, setSize] = useState(null);
  // const [ivOut, setOutput] = useState(null);
  useEffect(() => {
    (async function() {
      const canvas = new Canvas(canvasRef.current);
      await canvas.init();
    })();
    
    return () => {};
  })

  // useEffect(() => {
  //   (async function () {
  //     const width = 512, height = 512;
  //     canvasRef.current.width = width;
  //     canvasRef.current.height = height;
  //     pi.canvas = canvasRef.current;
  //     const session = new pi.GLSession(500);
  //     session.accessGraph(() => {
  //       const input1 = pi.graph.value.Image_ARGB_8888();
  //       // const bw = pi.graph.filters.BlackAndWhite(input1);
  //       // const bwCache = pi.graph.value.Image_ARGB_8888(bw);
  //       const input1Copy = pi.graph.basic_operations.Copy({ input: input1 });
  //       // const shape = pi.graph.basic_operations.ShapeOf(input1Copy);
  //       // const projectionMatrix = pi.graph.geometry.MakeOrthoProjectionMatrix({
  //       //     left: pi.graph.value.Float(0.),
  //       //     right: pi.graph.value.Float(30.),
  //       //     bottom: pi.graph.value.Float(-2.),
  //       //     top: pi.graph.value.Float(0.)
  //       // });
  //       const transformMatrixData = {
  //         sX: pi.graph.value.Float(1.), sY: pi.graph.value.Float(1.), sZ: pi.graph.value.Float(1.),  // scaling
  //         tX: pi.graph.value.Float(0.), tY: pi.graph.value.Float(0.), tZ: pi.graph.value.Float(0.),  // rotation 
  //         rX: pi.graph.value.Float(0.), rY: pi.graph.value.Float(0.), rZ: pi.graph.value.Float(0.),  // translation.
  //       };
  //       const transformMatrix = pi.graph.geometry.NewTransformMatrix(transformMatrixData);
  //       const input2 = pi.graph.value.Image_ARGB_8888();
  //       // const logTransformMatrixData = pi.graph.basic_operations.Log(transformMatrix);
  //       // const logProjectionMatrix = pi.graph.basic_operations.Log(projectionMatrix);
  //       const mesh = pi.graph.rendering.Mesh({
  //         input: input1Copy,
  //         image: input2,
  //         // blend_mode: pi.graph.value.Int(1),
  //         model_matrix: transformMatrix,
  //         // projection_matrix: logProjectionMatrix
  //       });

  //       const size = pi.graph.value.Point2i();
  //       const view = pi.graph.undocumented.RXImageView({ value: mesh, background: pi.graph.value.Image_ARGB_8888(), size: size, name: 'ImageView' });
  //       unstable_batchedUpdates(() => {
  //         setSession(session);
  //         setSize(size)
  //         setInput1(input1);
  //         setInput2(input2);
  //         setCord(transformMatrixData);
  //         setOutput(view);
  //       })
  //     });
  //   })()
  // }, [pi]);
  // const handlerChange = useCallback((e) => {
  //   const { value, name, dataset: { start = 0 } = {} } = e.target;
  //   const newValue = parseFloat(value) / 100 + parseFloat(start);
  //   session.accessGraph(() => {
  //     cord[name].value = Number(newValue);
  //     session.runValue(ivOut.output);
  //   });
  // }, [cord, ivOut, session])

  // const handlerClick = useCallback(async () => {
  //   const buffer = await getBufferFromUrl("https://cdn164.picsart.com/225975557060900.png");
  //   session.accessGraph(() => {
  //     const img = pi.core.ImageARGB8.create(buffer);
  //     input2.value = img;
  //     img.delete();
  //     session.runValue(ivOut.output);
  //   });
  // }, [input2, ivOut, pi, session]);
  // const handlerFile = useCallback(async (e) => {
  //   const [file] = e.target.files;
  //   if (!file) return;
  //   const buffer = await getBufferFromFile(file);
  //   const img = pi.core.ImageARGB8.create(buffer);
  //   const width = img.width;
  //   const height = img.height;
  //   session.accessGraph(() => {
  //     canvasRef.current.width = width;
  //     canvasRef.current.height = height;
  //     size.value = new pi.core.Point2i(width, height);
  //     input1.value = img
  //     img.delete();
  //     session.runValue(ivOut.output);
  //   });
  // }, [pi, session, size, input1, ivOut])
  return (
    <div>
      <div className='canvasWarper' >
        {/* <div>
          <div><input type='file' accept="image/png, image/jpeg" onChange={handlerFile} /></div>
          <div><input type='range' min='0' max='100' name='sX' defaultValue={100} onChange={handlerChange} /> <span>ScaleX </span> </div>
          <div><input type='range' min='0' max='100' name='sY' defaultValue={100} onChange={handlerChange} /> <span>ScaleY </span> </div>
          <div><input type='range' min='0' max='100' data-start={-0.5} name='tX' onChange={handlerChange} /> <span>RotateX </span> </div>
          <div><input type='range' min='0' max='100' data-start={-0.5} name='tY' onChange={handlerChange} /> <span>RotateY </span> </div>
          <div><input type='range' min='0' max='100' name='rZ' onChange={handlerChange} /> <span> Test </span> </div>
          <div> <button type='button' onClick={handlerClick} > Add Sticker </button></div>
        </div> */}
        <div><canvas ref={canvasRef} /></div>
      </div>
    </div>
  );
}

export default App;
