const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const url = require('url');


// 允许跨域
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// 设置路由
app.get('/', function (req, res) {
    res.send('欢迎来到我的网站！');
});

// 设置静态文件夹的目录
app.use(express.static('public'));

// 使用json格式解析请求体
app.use(express.json())
app.use(express.urlencoded({ extended: false }))



// 解析以 application/json 和 application/x-www-form-urlencoded 提交的数据
// var jsonParser = bodyParser.json();
// var urlencodedParser = bodyParser.urlencoded({ extended: false });

// // 创建API接口
// app.get('/tts', async (req, res) => {
//     console.log(req.query);
//     const { text, voice } = req.query;
//     const buffer = await tts.getTTSData(text, voice);

//     // const buffer = await mstts.getTTSData('欢迎来到我的网站,请输入要转换的文本', 'CN-Xiaoxiao');
//     res.send({ buffer });
// });

// // 创建API接口
// app.post('/tts', async (req, res) => {
//     console.log(req.body);
//     const { text, voice } = req.body;
//     const buffer = await tts.getTTSData(text, voice);
//     res.send({ buffer });
// });

// 启动服务
app.listen(3000, function () {
    console.log('服务器已启动，地址为 http://localhost:3000/');
    console.log('前端页面，地址为 http://localhost:3000/index.html');
});


