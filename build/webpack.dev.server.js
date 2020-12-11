/** @format */

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const mime = require('mime');
const config = require('../config');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.dev.conf');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const proxy = require('./proxy');
const formidable = require("formidable");

const PORT = config.dev.port,
  HOST = config.dev.host,
  DIST_DIR = path.join(config.dev.assetsRoot, config.viewOutputRoot()),
  app = express(),
  router = express.Router(),
  complier = webpack(
    merge(baseWebpackConfig, {
      devtool: 'eval-source-map'
    })
  );

// webpack-dev-server中间件
const devMiddleware = webpackDevMiddleware(complier, {
  publicPath: baseWebpackConfig.output.publicPath,
  quiet: false,
  stats: {
    colors: true,
    chunks: false
  }
});

app.use(devMiddleware);
app.use(webpackHotMiddleware(complier));
app.use('/views', express.static(path.join(config.dev.assetsRoot, 'views')));
app.use('/assets', express.static(path.join(config.dev.assetsRoot, 'assets')));
app.use('/js', express.static(path.join(config.dev.assetsRoot, 'js')));

// 代理
if (typeof config.dev.proxyTable === 'object') {
  for (let key in config.dev.proxyTable) {
    app.use(key, proxy(config.dev.proxyTable[key]));
  }
}

app.use(router);

app.all('/upload.do', function (req, res) {
  var action = req.query.action;
  if (action === 'uploadFile') {
    // 上传文件
    res.setHeader('Content-type', 'text/html;charset=utf-8');
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.multiples = true;
    //设置上传文件的大小
    form.maxFileSize = 2000 * 1024 * 1024;
    form.uploadDir = path.join(__dirname, "upload_images");
    form.parse(req, function (err, fields, files) {
      if(!files.file) return res.end(JSON.stringify({
        "state": "FAIL"
      }));
      var url = files.file.path.match(/upload_.+/)[0]
      res.end(JSON.stringify({
        "id": Math.random().toString().slice(2),
        "state": "SUCCESS",
        "url": url,
        "title": files.file.name,
        "size": files.file.size
      }))
    })
  }
});


// favicon
router.get('/favicon.ico', (req, res, next) => {
  res.end();
});

// 根路由
router.get('/', (req, res, next) => {
  config.spaMode
    ? sendFile(path.join(DIST_DIR, '/index.html'), res, next)
    : sendFile(path.join(DIST_DIR, 'index.html'), res, next);
});

router.get('/views', (req, res, next) => {
  sendFile(path.join(DIST_DIR, 'index.html'), res, next);
});

// 一级路由
router.get('/:view', (req, res, next) => {
  sendFile(path.join(DIST_DIR, req.params.view + '/index.html'), res, next);
});

// mock数据
router.get('/mock/:module', (req, res, next) => {
  sendFile(
    path.join(DIST_DIR + '/mock/' + req.params.module + '.json'),
    res,
    next
  );
});

// 二级路由
router.get('/:module/:view', (req, res, next) => {
  sendFile(
    path.join(
      DIST_DIR,
      req.params.module + '/' + req.params.view + '/index.html'
    ),
    res,
    next
  );
});

const sendFile = (viewname, response, next) => {
  complier.outputFileSystem.readFile(viewname, (err, result) => {
    if (err) {
      response.status(404).send('404');
      return;
    }
    response.set('content-type', mime.getType(viewname));
    response.send(result);
    response.end();
  });
};

module.exports = app.listen(PORT, err => {
  if (err) {
    return;
  }
  console.log(`Listening at http://${HOST}:${PORT}\n`);
});
