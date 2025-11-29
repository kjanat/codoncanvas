export default {
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          /** Disable a default plugin */
          cleanupIds: false,
          removeMetadata: false,

          /** Customize the params of a default plugin */
          // inlineStyles: {
          //   onlyMatchedOnce: false,
          // },
        },
      },
    },
    "cleanupListOfValues",
    {
      name: "convertColors",
      params: {
        currentColor: false,
        names2hex: false,
        rgb2hex: false,
        convertCase: "lower",
        shorthex: false,
        shortname: true,
      },
    },
    {
      name: "cleanupNumericValues",
      params: {
        floatPrecision: 3,
        leadingZero: true,
        defaultPx: true,
        convertToPx: false,
      },
    },
    "convertOneStopGradients",
    "convertStyleToAttrs",
    "removeDimensions",
    // "removeOffCanvasPaths"
    // "removeRasterImages"
    "removeStyleElement",
    // "removeXMLNS",
    "reusePaths",
    "removeXlink",
  ],
};
