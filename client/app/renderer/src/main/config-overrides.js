const {override} = require('customize-cra');
const path = require('path')

function addRenderer(config) {
    config.devtool = config.mode === 'development' ? 'cheap-module-source-map' : false;
    config.target = 'electron-renderer';
    if (config.mode === 'production') {
        const paths = require('react-scripts/config/paths');
        paths.appBuild = path.join(path.dirname(paths.appBuild), '../../pages/main');
        config.output.path = path.join(path.dirname(config.output.path), '../../pages/main');
        // config.publicPath = './'
    }
    return config;
}

module.exports = override(addRenderer);
