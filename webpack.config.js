var path = require('path');

module.exports = {
	entry: './js/main.js',
  output: {
  	path: path.resolve(__dirname, 'public', 'js'),
    filename: 'app.js'
  },
  module: {
  	loaders: [{
    	test: /\.js$/,
      loader: 'babel-loader',
      query: {
      	presets: ['es2015']
    	}
  	}]
	},
  stats: {
  	colors: true
  },
  devtool: 'source-map'
};
