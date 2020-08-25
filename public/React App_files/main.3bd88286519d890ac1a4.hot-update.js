webpackHotUpdate("main",{

/***/ "./src/components/App.js":
/*!*******************************!*\
  !*** ./src/components/App.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers */ "./src/helpers/index.js");
/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib */ "./src/lib/index.js");
var _jsxFileName = "/Users/ma/2020/pi-lib-drag/src/components/App.js";




function App() {
  const canvasRef = Object(react__WEBPACK_IMPORTED_MODULE_0__["useRef"])(null);
  Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(() => {
    (async function () {
      await Object(_lib__WEBPACK_IMPORTED_MODULE_2__["setNewSession"])(canvasRef.current);
      const layer = new _lib__WEBPACK_IMPORTED_MODULE_2__["Layer"]();
      const buffer = await Object(_helpers__WEBPACK_IMPORTED_MODULE_1__["getBufferFromUrl"])("/3T2uJg.png");
      layer.setInput(buffer);
      const layer1 = new _lib__WEBPACK_IMPORTED_MODULE_2__["Layer"]();
      const layer2 = new _lib__WEBPACK_IMPORTED_MODULE_2__["Layer"]();
      const buffer1 = await Object(_helpers__WEBPACK_IMPORTED_MODULE_1__["getBufferFromUrl"])("https://cdn151.picsart.com/225977472012900.png");
      const buffer2 = await Object(_helpers__WEBPACK_IMPORTED_MODULE_1__["getBufferFromUrl"])("https://cdn.shoplightspeed.com/shops/626275/files/18687427/600x600x1/stickers-northwest-sticker-ok.jpg");
      layer1.setInput(buffer1);
      layer2.setInput(buffer2);
      layer1.link(layer2);
      layer.link(layer1);
      layer.render();
    })();

    return () => {};
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 30,
      columnNumber: 5
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    className: "canvasWarper",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 7
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 41,
      columnNumber: 9
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("canvas", {
    ref: canvasRef,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 41,
      columnNumber: 14
    }
  }))));
}

/* harmony default export */ __webpack_exports__["default"] = (App);

/***/ })

})
//# sourceMappingURL=main.3bd88286519d890ac1a4.hot-update.js.map