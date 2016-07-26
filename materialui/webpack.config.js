module.exports = {
  context: __dirname + "/app",
  entry: {
    javascript: "./main.jsx",
    html: "./index.html",
  },
  output: {
    filename: "bundle.js",
    path: __dirname + "/dist",
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: "file?name=[path][name].[ext]",
      },
      {
        test: /\.css$/,
        loader: "file?name=[path][name].[ext]"
      },
      { 
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel', 
        query: {
          presets: ['es2015', 'stage-0', 'react']
        }
      },
      { test: /\.coffee$/, loader: "coffee-loader" },
      { test: /\.(coffee\.md|litcoffee)$/, loader: "coffee-loader?literate" },
    ],
  },
}
