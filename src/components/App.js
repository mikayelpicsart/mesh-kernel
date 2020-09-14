import React, { useEffect, useRef } from 'react';
import { getBufferFromUrl } from '../helpers';
import { setNewSession, Layer } from '../lib';

const arrayStickers = [
  'https://pastatic.picsart.com/24223727131055538105.png?to=min&r=100',
  'https://pastatic.picsart.com/19309331335674000898.png?to=min&r=100',
  'https://cdn140.picsart.com/335970175091211.png?to=min&r=100',
  'https://cdn141.picsart.com/333097131030211.png?to=min&r=100',
  'https://cdn131.picsart.com/333172623011211.png?to=min&r=100',
  'https://cdn176.picsart.com/225974407017900.png?to=min&r=100',
  'https://cdn140.picsart.com/335015997031211.png?to=min&r=100',
  'https://cdn156.picsart.com/225974407023900.png?to=min&r=100',
  'https://pastatic.picsart.com/75980729942641134313.png?to=min&r=100',
  'https://pastatic.picsart.com/03313376547977788417.png?to=min&r=100',
  'https://cdn131.picsart.com/332918605060211.png?to=min&r=100',
  'https://cdn131.picsart.com/333210081042211.png?to=min&r=100',
  'https://pastatic.picsart.com/58129437085591952634.png?to=min&r=100',
  'https://cdn131.picsart.com/333005104094211.png?to=min&r=100',
  'https://pastatic.picsart.com/24223727131055538105.png?to=min&r=100',
  'https://pastatic.picsart.com/19309331335674000898.png?to=min&r=100',
  'https://cdn140.picsart.com/335970175091211.png?to=min&r=100',
  'https://cdn141.picsart.com/333097131030211.png?to=min&r=100',
  'https://cdn131.picsart.com/333172623011211.png?to=min&r=100',
  'https://cdn176.picsart.com/225974407017900.png?to=min&r=100',
  'https://cdn140.picsart.com/335015997031211.png?to=min&r=100',
  'https://cdn156.picsart.com/225974407023900.png?to=min&r=100',
  'https://pastatic.picsart.com/75980729942641134313.png?to=min&r=100',
  'https://pastatic.picsart.com/03313376547977788417.png?to=min&r=100',
  'https://cdn131.picsart.com/332918605060211.png?to=min&r=100',
  'https://cdn131.picsart.com/333210081042211.png?to=min&r=100',
  'https://pastatic.picsart.com/58129437085591952634.png?to=min&r=100',
  'https://cdn131.picsart.com/333005104094211.png?to=min&r=100',
  'https://cdn131.picsart.com/333210081042211.png?to=min&r=100',
  'https://pastatic.picsart.com/58129437085591952634.png?to=min&r=100',
  'https://cdn131.picsart.com/333005104094211.png?to=min&r=100'
]

function App() {
  const canvasRef = useRef(null);
  useEffect(() => {
    (async function () {
      await setNewSession(canvasRef.current);
      const layer = new Layer();
      const buffer = await getBufferFromUrl("/3T2uJg.png");
      layer.setInput(buffer);
      const buffers = await Promise.all( arrayStickers.map(item => getBufferFromUrl(item)));
      const layers = buffers.map(buffer => ({ buffer, layer: new Layer() }))
        .map(({layer, buffer }) => { layer.setInput(buffer); return layer } );
      layers.forEach((layerItem, index, arr) => {
       
          layer.add(layerItem, { top: ((index % 19) * 5.26 + 2.63), left: Math.floor(index / 19) * 4 + 2 });
         
        
      })
      const layertest = new Layer();
      const buffertest = await getBufferFromUrl("https://cdn131.picsart.com/332918605060211.png?to=min&r=200");
      layertest.setInput(buffertest);
      layer.add(layertest, { top: 12 * 5, left: 12 * 5 }, 700);
      layer.render();
      console.log(layer);
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
        <div><canvas ref={canvasRef} style={{ border: '1px solid black' }} /></div>
      </div>
    </div>
  );
}

export default App;
