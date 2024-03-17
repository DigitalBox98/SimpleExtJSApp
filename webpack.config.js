const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production', // Enable webpack's built-in optimizations for production mode
    entry: './src/src/index.js', // Adjust this to the path of your JS file
    output: {
        filename: 'rr-manager.js', // The output file name
        path: path.resolve(__dirname, './src/app/'), // Output directory
    },
    optimization: {
        minimize: true, // Enable minimization
        minimizer: [new TerserPlugin()], // Use TerserPlugin for minification
    },
};