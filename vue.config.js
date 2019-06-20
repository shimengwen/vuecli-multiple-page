const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const glob = require('glob')
const titles = require('./pagemap.js')

const pages = {}

glob.sync('./src/views/**/index.js').forEach((filePath) => {
	
	let chunk = filePath.split('./src/views/')[1].split('/index.js')[0]
	const chunkFirstName = chunk.split('/')[0]
	
	if(chunkFirstName == 'user') {
		chunk += '/index'
	}

	pages[chunk] = {
		entry: filePath,
		template: 'public/index.html',
		title: titles[chunk],
		chunks: ['chunk-vendors', 'chunk-common', chunk]
	}
})




console.log('process.env.NODE_ENV ==' + process.env.NODE_ENV)
module.exports = {
  // baseUrl: '/pcpages',
  pages,
  lintOnSave: true,
  outputDir: './dist',
  productionSourceMap: !(process.env.NODE_ENV === 'production'),
  devServer: {
    port: 83,
    proxy: {
      '/openplatform': {
        target: 'http://127.0.0.1:80',
        ws: true,
        changeOrigin: true
      }
    } // 配置开发环境 URL 便于本地开发调试
  },
  chainWebpack: (config) => {
    config.plugins.delete('named-chunks')
    config.externals({
      'CKEDITOR': 'window.CKEDITOR'
    })
  },
  configureWebpack: (config) => {
    const plugins = [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            drop_console: true
          }
        },
        sourceMap: true
      })
    ]
    // splitChunk 配置
    const splitChunksConfig = {
      cacheGroups: {
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial',
          minChunks: 2
        },
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    }
    if (process.env.NODE_ENV === 'production') {
      config.plugins = [...config.plugins, ...plugins]
      config.optimization.splitChunks = splitChunksConfig
    }
  }
}