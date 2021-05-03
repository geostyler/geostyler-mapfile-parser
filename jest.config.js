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
    "/node_modules/(?!(geostyler-style|(rc-*[a-z]*))/).*/"
  ]
};
