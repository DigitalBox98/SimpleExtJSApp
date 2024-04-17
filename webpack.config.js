const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    target: ['web', 'es5'], // Adjust this to your target environment
    mode: 'development', // Enable webpack's built-in optimizations for production mode
    entry: './src/src/index.js', // Adjust this to the path of your JS file
    output: {
        filename: 'rr-manager.js', // The output file name
        path: path.resolve(__dirname, './src/app/'), // Output directory
        // chunkFormat: 'array-push', // Output format
        // Other output settings...
        environment: {
            // Specify the environment features you want to use
            arrowFunction: false, // Use arrow functions
            const: true, // Use const and let
            module: true, // Target environment supports ES6 module natively
        },
    },
    // optimization: {
    //     minimize: true, // Enable minimization
    //     minimizer: [new TerserPlugin()], // Use TerserPlugin for minification
    // },
    experiments: {
        outputModule: true, // Enable outputting module format
    },
};