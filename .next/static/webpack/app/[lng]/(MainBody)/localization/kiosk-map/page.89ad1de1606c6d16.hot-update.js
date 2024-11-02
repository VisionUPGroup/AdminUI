"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/[lng]/(MainBody)/localization/kiosk-map/page",{

/***/ "(app-pages-browser)/./src/Components/Localization/KioskMap/index.tsx":
/*!********************************************************!*\
  !*** ./src/Components/Localization/KioskMap/index.tsx ***!
  \********************************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! leaflet */ \"(app-pages-browser)/./node_modules/leaflet/dist/leaflet-src.js\");\n/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(leaflet__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var leaflet_dist_leaflet_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! leaflet/dist/leaflet.css */ \"(app-pages-browser)/./node_modules/leaflet/dist/leaflet.css\");\n/* harmony import */ var _Api_kioskService__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../Api/kioskService */ \"(app-pages-browser)/./Api/kioskService.js\");\n\nvar _s = $RefreshSig$();\n\n\n\n\nconst Map = ()=>{\n    _s();\n    const { fetchAllKiosk } = (0,_Api_kioskService__WEBPACK_IMPORTED_MODULE_4__.useKioskService)();\n    const [kiosks, setKiosks] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        const key = \"uoQDJZ1IqayiRy7cs3QA\"; // Your API key\n        const mapContainer = document.getElementById(\"map\");\n        if (!mapContainer) {\n            console.error(\"Map container not found!\");\n            return;\n        }\n        const map = leaflet__WEBPACK_IMPORTED_MODULE_2___default().map(mapContainer).setView([\n            21.0285,\n            105.8542\n        ], 6);\n        leaflet__WEBPACK_IMPORTED_MODULE_2___default().tileLayer(\"https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=\".concat(key), {\n            tileSize: 512,\n            zoomOffset: -1,\n            minZoom: 1,\n            crossOrigin: true\n        }).addTo(map);\n        // Custom SVG icon for kiosks\n        const kioskIcon = leaflet__WEBPACK_IMPORTED_MODULE_2___default().divIcon({\n            className: \"custom-kiosk-icon\",\n            html: '\\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"25\" height=\"41\" viewBox=\"0 0 25 41\">\\n  <rect width=\"25\" height=\"41\" fill=\"none\"/>\\n  <path d=\"M 5 20 L 12.5 10 L 20 20\" stroke=\"black\" stroke-width=\"2\" fill=\"none\"/>\\n  <path d=\"M 5 20 L 5 30 L 20 30 L 20 20\" stroke=\"black\" stroke-width=\"2\" fill=\"none\"/>\\n</svg>\\n\\n\\n      ',\n            iconSize: [\n                25,\n                41\n            ],\n            iconAnchor: [\n                12.5,\n                41\n            ],\n            popupAnchor: [\n                0,\n                -34\n            ]\n        });\n        const geocodeCache = {};\n        const loadKiosks = async ()=>{\n            try {\n                const fetchedKiosks = await fetchAllKiosk();\n                if (fetchedKiosks) {\n                    // Only include kiosks with status true\n                    const activeKiosks = fetchedKiosks.filter((kiosk)=>kiosk.status === true);\n                    setKiosks(activeKiosks);\n                    const geocodePromises = activeKiosks.map(async (kiosk)=>{\n                        if (geocodeCache[kiosk.address]) {\n                            return {\n                                ...kiosk,\n                                coordinates: geocodeCache[kiosk.address]\n                            };\n                        }\n                        try {\n                            const geocodeResponse = await fetch(\"https://api.maptiler.com/geocoding/\".concat(encodeURIComponent(kiosk.address), \".json?key=\").concat(key));\n                            if (!geocodeResponse.ok) throw new Error(\"Failed to fetch geocode for \".concat(kiosk.address));\n                            const geocodeData = await geocodeResponse.json();\n                            if (geocodeData.features && geocodeData.features.length > 0) {\n                                const { coordinates } = geocodeData.features[0].geometry;\n                                geocodeCache[kiosk.address] = coordinates;\n                                return {\n                                    ...kiosk,\n                                    coordinates\n                                };\n                            } else {\n                                console.error(\"Geocoding failed for address: \".concat(kiosk.address));\n                            }\n                        } catch (error) {\n                            console.error(error);\n                        }\n                        return null;\n                    });\n                    const results = await Promise.all(geocodePromises);\n                    results.forEach((result)=>{\n                        if (result) {\n                            const marker = leaflet__WEBPACK_IMPORTED_MODULE_2___default().marker([\n                                result.coordinates[1],\n                                result.coordinates[0]\n                            ], {\n                                icon: kioskIcon\n                            }).addTo(map);\n                            marker.bindPopup(\"<b>\".concat(result.name, \"</b><br>\").concat(result.address, \"<br>\").concat(result.phoneNumber, \"<br>\").concat(result.openingHours));\n                        }\n                    });\n                }\n            } catch (error) {\n                console.error(\"Error fetching kiosks:\", error);\n            } finally{\n                setLoading(false);\n            }\n        };\n        loadKiosks();\n        return ()=>{\n            map.remove();\n        };\n    }, []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        children: [\n            loading && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                children: \"Loading kiosks...\"\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\ACER\\\\Desktop\\\\Admin Project 2\\\\Admin\\\\src\\\\Components\\\\Localization\\\\KioskMap\\\\index.tsx\",\n                lineNumber: 124,\n                columnNumber: 19\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                id: \"map\",\n                style: {\n                    height: \"100vh\",\n                    width: \"100%\"\n                }\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\ACER\\\\Desktop\\\\Admin Project 2\\\\Admin\\\\src\\\\Components\\\\Localization\\\\KioskMap\\\\index.tsx\",\n                lineNumber: 125,\n                columnNumber: 7\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"a\", {\n                href: \"https://www.maptiler.com\",\n                style: {\n                    position: \"absolute\",\n                    left: \"10px\",\n                    bottom: \"10px\",\n                    zIndex: 999\n                },\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"img\", {\n                    src: \"https://api.maptiler.com/resources/logo.svg\",\n                    alt: \"MapTiler logo\"\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\ACER\\\\Desktop\\\\Admin Project 2\\\\Admin\\\\src\\\\Components\\\\Localization\\\\KioskMap\\\\index.tsx\",\n                    lineNumber: 127,\n                    columnNumber: 9\n                }, undefined)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\ACER\\\\Desktop\\\\Admin Project 2\\\\Admin\\\\src\\\\Components\\\\Localization\\\\KioskMap\\\\index.tsx\",\n                lineNumber: 126,\n                columnNumber: 7\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"a\", {\n                        href: \"https://www.maptiler.com/copyright/\",\n                        target: \"_blank\",\n                        rel: \"noopener noreferrer\",\n                        children: \"\\xa9 MapTiler\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ACER\\\\Desktop\\\\Admin Project 2\\\\Admin\\\\src\\\\Components\\\\Localization\\\\KioskMap\\\\index.tsx\",\n                        lineNumber: 130,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"a\", {\n                        href: \"https://www.openstreetmap.org/copyright\",\n                        target: \"_blank\",\n                        rel: \"noopener noreferrer\",\n                        children: \"\\xa9 OpenStreetMap contributors\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\ACER\\\\Desktop\\\\Admin Project 2\\\\Admin\\\\src\\\\Components\\\\Localization\\\\KioskMap\\\\index.tsx\",\n                        lineNumber: 131,\n                        columnNumber: 9\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\ACER\\\\Desktop\\\\Admin Project 2\\\\Admin\\\\src\\\\Components\\\\Localization\\\\KioskMap\\\\index.tsx\",\n                lineNumber: 129,\n                columnNumber: 7\n            }, undefined)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\ACER\\\\Desktop\\\\Admin Project 2\\\\Admin\\\\src\\\\Components\\\\Localization\\\\KioskMap\\\\index.tsx\",\n        lineNumber: 123,\n        columnNumber: 5\n    }, undefined);\n};\n_s(Map, \"i6k/N7Bj9ZCw/meH19SY4i64BmI=\", false, function() {\n    return [\n        _Api_kioskService__WEBPACK_IMPORTED_MODULE_4__.useKioskService\n    ];\n});\n_c = Map;\n/* harmony default export */ __webpack_exports__[\"default\"] = (Map);\nvar _c;\n$RefreshReg$(_c, \"Map\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9Db21wb25lbnRzL0xvY2FsaXphdGlvbi9LaW9za01hcC9pbmRleC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFtRDtBQUMzQjtBQUNVO0FBQzZCO0FBZ0IvRCxNQUFNSyxNQUFnQjs7SUFDcEIsTUFBTSxFQUFFQyxhQUFhLEVBQUUsR0FBR0Ysa0VBQWVBO0lBQ3pDLE1BQU0sQ0FBQ0csUUFBUUMsVUFBVSxHQUFHTiwrQ0FBUUEsQ0FBVSxFQUFFO0lBQ2hELE1BQU0sQ0FBQ08sU0FBU0MsV0FBVyxHQUFHUiwrQ0FBUUEsQ0FBVTtJQUVoREQsZ0RBQVNBLENBQUM7UUFDUixNQUFNVSxNQUFNLHdCQUF3QixlQUFlO1FBQ25ELE1BQU1DLGVBQWVDLFNBQVNDLGNBQWMsQ0FBQztRQUU3QyxJQUFJLENBQUNGLGNBQWM7WUFDakJHLFFBQVFDLEtBQUssQ0FBQztZQUNkO1FBQ0Y7UUFFQSxNQUFNQyxNQUFNZCxrREFBSyxDQUFDUyxjQUFjTSxPQUFPLENBQUM7WUFBQztZQUFTO1NBQVMsRUFBRTtRQUU3RGYsd0RBQVcsQ0FBQyxnRUFBb0UsT0FBSlEsTUFBTztZQUNqRlMsVUFBVTtZQUNWQyxZQUFZLENBQUM7WUFDYkMsU0FBUztZQUNUQyxhQUFhO1FBQ2YsR0FBR0MsS0FBSyxDQUFDUDtRQUVULDZCQUE2QjtRQUM3QixNQUFNUSxZQUFZdEIsc0RBQVMsQ0FBQztZQUMxQndCLFdBQVc7WUFDWEMsTUFBTztZQVNQQyxVQUFVO2dCQUFDO2dCQUFJO2FBQUc7WUFDbEJDLFlBQVk7Z0JBQUM7Z0JBQU07YUFBRztZQUN0QkMsYUFBYTtnQkFBQztnQkFBRyxDQUFDO2FBQUc7UUFDdkI7UUFFQSxNQUFNQyxlQUF3RCxDQUFDO1FBRS9ELE1BQU1DLGFBQWE7WUFDakIsSUFBSTtnQkFDRixNQUFNQyxnQkFBeUIsTUFBTTVCO2dCQUNyQyxJQUFJNEIsZUFBZTtvQkFDakIsdUNBQXVDO29CQUN2QyxNQUFNQyxlQUFlRCxjQUFjRSxN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IjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL0NvbXBvbmVudHMvTG9jYWxpemF0aW9uL0tpb3NrTWFwL2luZGV4LnRzeD9jYzRkIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgTCBmcm9tICdsZWFmbGV0JztcclxuaW1wb3J0ICdsZWFmbGV0L2Rpc3QvbGVhZmxldC5jc3MnO1xyXG5pbXBvcnQgeyB1c2VLaW9za1NlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9BcGkva2lvc2tTZXJ2aWNlJztcclxuXHJcbi8vIERlZmluZSB0eXBlIGZvciBraW9zayBkYXRhXHJcbmludGVyZmFjZSBLaW9zayB7XHJcbiAgaWQ6IG51bWJlcjtcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgYWRkcmVzczogc3RyaW5nO1xyXG4gIHBob25lTnVtYmVyOiBzdHJpbmc7XHJcbiAgZW1haWw6IHN0cmluZztcclxuICBhY2NvdW50SUQ6IG51bWJlcjtcclxuICBvcGVuaW5nSG91cnM6IHN0cmluZztcclxuICBjcmVhdGVkQXQ6IHN0cmluZztcclxuICB1cGRhdGVkQXQ6IHN0cmluZztcclxuICBzdGF0dXM6IGJvb2xlYW47XHJcbn1cclxuXHJcbmNvbnN0IE1hcDogUmVhY3QuRkMgPSAoKSA9PiB7XHJcbiAgY29uc3QgeyBmZXRjaEFsbEtpb3NrIH0gPSB1c2VLaW9za1NlcnZpY2UoKTtcclxuICBjb25zdCBba2lvc2tzLCBzZXRLaW9za3NdID0gdXNlU3RhdGU8S2lvc2tbXT4oW10pO1xyXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlPGJvb2xlYW4+KHRydWUpO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgY29uc3Qga2V5ID0gJ3VvUURKWjFJcWF5aVJ5N2NzM1FBJzsgLy8gWW91ciBBUEkga2V5XHJcbiAgICBjb25zdCBtYXBDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwJyk7XHJcblxyXG4gICAgaWYgKCFtYXBDb250YWluZXIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignTWFwIGNvbnRhaW5lciBub3QgZm91bmQhJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtYXAgPSBMLm1hcChtYXBDb250YWluZXIpLnNldFZpZXcoWzIxLjAyODUsIDEwNS44NTQyXSwgNik7XHJcblxyXG4gICAgTC50aWxlTGF5ZXIoYGh0dHBzOi8vYXBpLm1hcHRpbGVyLmNvbS9tYXBzL3N0cmVldHMtdjIve3p9L3t4fS97eX0ucG5nP2tleT0ke2tleX1gLCB7XHJcbiAgICAgIHRpbGVTaXplOiA1MTIsXHJcbiAgICAgIHpvb21PZmZzZXQ6IC0xLFxyXG4gICAgICBtaW5ab29tOiAxLFxyXG4gICAgICBjcm9zc09yaWdpbjogdHJ1ZSxcclxuICAgIH0pLmFkZFRvKG1hcCk7XHJcblxyXG4gICAgLy8gQ3VzdG9tIFNWRyBpY29uIGZvciBraW9za3NcclxuICAgIGNvbnN0IGtpb3NrSWNvbiA9IEwuZGl2SWNvbih7XHJcbiAgICAgIGNsYXNzTmFtZTogJ2N1c3RvbS1raW9zay1pY29uJyxcclxuICAgICAgaHRtbDogYFxyXG48c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjI1XCIgaGVpZ2h0PVwiNDFcIiB2aWV3Qm94PVwiMCAwIDI1IDQxXCI+XHJcbiAgPHJlY3Qgd2lkdGg9XCIyNVwiIGhlaWdodD1cIjQxXCIgZmlsbD1cIm5vbmVcIi8+XHJcbiAgPHBhdGggZD1cIk0gNSAyMCBMIDEyLjUgMTAgTCAyMCAyMFwiIHN0cm9rZT1cImJsYWNrXCIgc3Ryb2tlLXdpZHRoPVwiMlwiIGZpbGw9XCJub25lXCIvPlxyXG4gIDxwYXRoIGQ9XCJNIDUgMjAgTCA1IDMwIEwgMjAgMzAgTCAyMCAyMFwiIHN0cm9rZT1cImJsYWNrXCIgc3Ryb2tlLXdpZHRoPVwiMlwiIGZpbGw9XCJub25lXCIvPlxyXG48L3N2Zz5cclxuXHJcblxyXG4gICAgICBgLFxyXG4gICAgICBpY29uU2l6ZTogWzI1LCA0MV0sIC8vIFNpemUgb2YgdGhlIGljb25cclxuICAgICAgaWNvbkFuY2hvcjogWzEyLjUsIDQxXSwgLy8gUG9pbnQgb2YgdGhlIGljb24gd2hpY2ggd2lsbCBjb3JyZXNwb25kIHRvIG1hcmtlcidzIGxvY2F0aW9uXHJcbiAgICAgIHBvcHVwQW5jaG9yOiBbMCwgLTM0XSwgLy8gUG9pbnQgZnJvbSB3aGljaCB0aGUgcG9wdXAgc2hvdWxkIG9wZW4gcmVsYXRpdmUgdG8gdGhlIGljb25BbmNob3JcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGdlb2NvZGVDYWNoZTogeyBbYWRkcmVzczogc3RyaW5nXTogW251bWJlciwgbnVtYmVyXSB9ID0ge307XHJcblxyXG4gICAgY29uc3QgbG9hZEtpb3NrcyA9IGFzeW5jICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBmZXRjaGVkS2lvc2tzOiBLaW9za1tdID0gYXdhaXQgZmV0Y2hBbGxLaW9zaygpO1xyXG4gICAgICAgIGlmIChmZXRjaGVkS2lvc2tzKSB7XHJcbiAgICAgICAgICAvLyBPbmx5IGluY2x1ZGUga2lvc2tzIHdpdGggc3RhdHVzIHRydWVcclxuICAgICAgICAgIGNvbnN0IGFjdGl2ZUtpb3NrcyA9IGZldGNoZWRLaW9za3MuZmlsdGVyKGtpb3NrID0+IGtpb3NrLnN0YXR1cyA9PT0gdHJ1ZSk7XHJcbiAgICAgICAgICBzZXRLaW9za3MoYWN0aXZlS2lvc2tzKTtcclxuICAgIFxyXG4gICAgICAgICAgY29uc3QgZ2VvY29kZVByb21pc2VzID0gYWN0aXZlS2lvc2tzLm1hcChhc3luYyAoa2lvc2spID0+IHtcclxuICAgICAgICAgICAgaWYgKGdlb2NvZGVDYWNoZVtraW9zay5hZGRyZXNzXSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiB7IC4uLmtpb3NrLCBjb29yZGluYXRlczogZ2VvY29kZUNhY2hlW2tpb3NrLmFkZHJlc3NdIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGdlb2NvZGVSZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgICAgICAgICAgICAgYGh0dHBzOi8vYXBpLm1hcHRpbGVyLmNvbS9nZW9jb2RpbmcvJHtlbmNvZGVVUklDb21wb25lbnQoa2lvc2suYWRkcmVzcyl9Lmpzb24/a2V5PSR7a2V5fWBcclxuICAgICAgICAgICAgICApO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgaWYgKCFnZW9jb2RlUmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIGdlb2NvZGUgZm9yICR7a2lvc2suYWRkcmVzc31gKTtcclxuICAgICAgICAgICAgICBjb25zdCBnZW9jb2RlRGF0YSA9IGF3YWl0IGdlb2NvZGVSZXNwb25zZS5qc29uKCk7XHJcbiAgICBcclxuICAgICAgICAgICAgICBpZiAoZ2VvY29kZURhdGEuZmVhdHVyZXMgJiYgZ2VvY29kZURhdGEuZmVhdHVyZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBjb29yZGluYXRlcyB9ID0gZ2VvY29kZURhdGEuZmVhdHVyZXNbMF0uZ2VvbWV0cnk7XHJcbiAgICAgICAgICAgICAgICBnZW9jb2RlQ2FjaGVba2lvc2suYWRkcmVzc10gPSBjb29yZGluYXRlcztcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IC4uLmtpb3NrLCBjb29yZGluYXRlcyB9O1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBHZW9jb2RpbmcgZmFpbGVkIGZvciBhZGRyZXNzOiAke2tpb3NrLmFkZHJlc3N9YCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChnZW9jb2RlUHJvbWlzZXMpO1xyXG4gICAgXHJcbiAgICAgICAgICByZXN1bHRzLmZvckVhY2goKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbWFya2VyID0gTC5tYXJrZXIoW3Jlc3VsdC5jb29yZGluYXRlc1sxXSwgcmVzdWx0LmNvb3JkaW5hdGVzWzBdXSwgeyBpY29uOiBraW9za0ljb24gfSkuYWRkVG8obWFwKTtcclxuICAgICAgICAgICAgICBtYXJrZXIuYmluZFBvcHVwKFxyXG4gICAgICAgICAgICAgICAgYDxiPiR7cmVzdWx0Lm5hbWV9PC9iPjxicj4ke3Jlc3VsdC5hZGRyZXNzfTxicj4ke3Jlc3VsdC5waG9uZU51bWJlcn08YnI+JHtyZXN1bHQub3BlbmluZ0hvdXJzfWBcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGZldGNoaW5nIGtpb3NrczpcIiwgZXJyb3IpO1xyXG4gICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgXHJcblxyXG4gICAgbG9hZEtpb3NrcygpO1xyXG5cclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIG1hcC5yZW1vdmUoKTtcclxuICAgIH07XHJcbiAgfSwgW10pO1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdj5cclxuICAgICAge2xvYWRpbmcgJiYgPHA+TG9hZGluZyBraW9za3MuLi48L3A+fVxyXG4gICAgICA8ZGl2IGlkPVwibWFwXCIgc3R5bGU9e3sgaGVpZ2h0OiAnMTAwdmgnLCB3aWR0aDogJzEwMCUnIH19PjwvZGl2PlxyXG4gICAgICA8YSBocmVmPVwiaHR0cHM6Ly93d3cubWFwdGlsZXIuY29tXCIgc3R5bGU9e3sgcG9zaXRpb246ICdhYnNvbHV0ZScsIGxlZnQ6ICcxMHB4JywgYm90dG9tOiAnMTBweCcsIHpJbmRleDogOTk5IH19PlxyXG4gICAgICAgIDxpbWcgc3JjPVwiaHR0cHM6Ly9hcGkubWFwdGlsZXIuY29tL3Jlc291cmNlcy9sb2dvLnN2Z1wiIGFsdD1cIk1hcFRpbGVyIGxvZ29cIiAvPlxyXG4gICAgICA8L2E+XHJcbiAgICAgIDxwPlxyXG4gICAgICAgIDxhIGhyZWY9XCJodHRwczovL3d3dy5tYXB0aWxlci5jb20vY29weXJpZ2h0L1wiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIj4mY29weTsgTWFwVGlsZXI8L2E+XHJcbiAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vd3d3Lm9wZW5zdHJlZXRtYXAub3JnL2NvcHlyaWdodFwiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIj4mY29weTsgT3BlblN0cmVldE1hcCBjb250cmlidXRvcnM8L2E+XHJcbiAgICAgIDwvcD5cclxuICAgIDwvZGl2PlxyXG4gICk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYXA7XHJcbiJdLCJuYW1lcyI6WyJSZWFjdCIsInVzZUVmZmVjdCIsInVzZVN0YXRlIiwiTCIsInVzZUtpb3NrU2VydmljZSIsIk1hcCIsImZldGNoQWxsS2lvc2siLCJraW9za3MiLCJzZXRLaW9za3MiLCJsb2FkaW5nIiwic2V0TG9hZGluZyIsImtleSIsIm1hcENvbnRhaW5lciIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJjb25zb2xlIiwiZXJyb3IiLCJtYXAiLCJzZXRWaWV3IiwidGlsZUxheWVyIiwidGlsZVNpemUiLCJ6b29tT2Zmc2V0IiwibWluWm9vbSIsImNyb3NzT3JpZ2luIiwiYWRkVG8iLCJraW9za0ljb24iLCJkaXZJY29uIiwiY2xhc3NOYW1lIiwiaHRtbCIsImljb25TaXplIiwiaWNvbkFuY2hvciIsInBvcHVwQW5jaG9yIiwiZ2VvY29kZUNhY2hlIiwibG9hZEtpb3NrcyIsImZldGNoZWRLaW9za3MiLCJhY3RpdmVLaW9za3MiLCJmaWx0ZXIiLCJraW9zayIsInN0YXR1cyIsImdlb2NvZGVQcm9taXNlcyIsImFkZHJlc3MiLCJjb29yZGluYXRlcyIsImdlb2NvZGVSZXNwb25zZSIsImZldGNoIiwiZW5jb2RlVVJJQ29tcG9uZW50Iiwib2siLCJFcnJvciIsImdlb2NvZGVEYXRhIiwianNvbiIsImZlYXR1cmVzIiwibGVuZ3RoIiwiZ2VvbWV0cnkiLCJyZXN1bHRzIiwiUHJvbWlzZSIsImFsbCIsImZvckVhY2giLCJyZXN1bHQiLCJtYXJrZXIiLCJpY29uIiwiYmluZFBvcHVwIiwibmFtZSIsInBob25lTnVtYmVyIiwib3BlbmluZ0hvdXJzIiwicmVtb3ZlIiwiZGl2IiwicCIsImlkIiwic3R5bGUiLCJoZWlnaHQiLCJ3aWR0aCIsImEiLCJocmVmIiwicG9zaXRpb24iLCJsZWZ0IiwiYm90dG9tIiwiekluZGV4IiwiaW1nIiwic3JjIiwiYWx0IiwidGFyZ2V0IiwicmVsIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/Components/Localization/KioskMap/index.tsx\n"));

/***/ })

});