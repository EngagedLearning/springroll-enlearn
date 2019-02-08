module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: false,
        spec: false,
        loose: true,
      },
    ],
  ],
  env: {
    test: {
      presets: [
        [
          "@babel/preset-env",
          {
            spec: false,
            loose: true,
            exclude: ["@babel/plugin-transform-regenerator"],
          },
        ],
      ],
    },
  },
};
