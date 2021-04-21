module.exports = {
  "moduleFileExtensions": [
    "ts",
    "js"
  ],
  "transform": {
    "^.+\\.ts$": "<rootDir>/node_modules/babel-jest",
    "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
  },
  "testRegex": "/src/.*\\.spec.(ts|js)$",
  "collectCoverageFrom": [
    "src/*.ts"
  ],
  "transformIgnorePatterns": [
    "/node_modules/(?!(geostyler-style|ol|css-animation|labelgun|mapbox-to-ol-style|ol-mapbox-style|antd|@terrestris|(rc-*[a-z]*))/).*/"
  ]
};
