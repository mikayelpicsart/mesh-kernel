import React, { useEffect, useRef } from 'react';
import { getBufferFromUrl } from '../helpers';
import { setNewSession, Layer } from '../lib';

function App() {
  const canvasRef = useRef(null);
  useEffect(() => {
    (async function () {
      await setNewSession(canvasRef.current);
      const layer = new Layer();
      const layer1 = new Layer();
      const layer2 = new Layer();
      const buffers = await Promise.all([
        getBufferFromUrl("/3T2uJg.png"),
        getBufferFromUrl("https://cdn151.picsart.com/225977472012900.png"),
        getBufferFromUrl("https://cdn.shoplightspeed.com/shops/626275/files/18687427/600x600x1/stickers-northwest-sticker-ok.jpg")
      ])
      layer.setInput(buffers[0]);
      layer1.setInput(buffers[1]);
      layer2.setInput(buffers[2]);
      layer1.add(layer2)
      layer.add(layer1);
      layer.render();

    })();

    return () => { };
  })

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
