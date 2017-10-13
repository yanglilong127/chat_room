const express=require('express');
const app=express();
const server=require('http').createServer(app);
const io=require('socket.io').listen(server);
const _=require('underscore');

app.use(express.static('./src'));

server.listen(8088,(err)=>{
	if(err)
		throw err;
	else{
		console.log('成功监听8088端口');
	}
});


// 检查昵称是否重复
// io.sockets.sockets 返回所有在线的socket对象集合
var checkNickname = function(name){
    for(var k in io.sockets.sockets){
        if(io.sockets.sockets.hasOwnProperty(k)){
            if(io.sockets.sockets[k] && io.sockets.sockets[k].nickname == name){
                return true;
            }
        }
    }
    return false;
}

//在线用户数量
//console.log(io.eio.clientsCount);
/*****
io.eio.clientsCount  // 链接数量
socket.adapter.rooms // 所有房间
socket.nsp.connected // 所有链接
***/

io.on('connection',(socket)=>{
	//用户登录
	socket.on('login',(username)=>{
		if(checkNickname(username)){  //用户名已存在
			socket.emit('nickname');
		}else{
			//socket.id;   唯一
			socket.nickname=username;
			socket.emit('loginSuccess');   //登录成功
			var nums=io.eio.clientsCount;  //在线人数
			io.sockets.emit('system',username,nums,'login');
		}
	});

	//用户断开连接
	socket.on('disconnect',()=>{
		if(socket.nickname!= null){
			var nums=io.eio.clientsCount;  //在线人数
			socket.broadcast.emit('system',socket.nickname,nums,'logout')
		}
	});

	//用户发广播消息
	socket.on('msg',(msg)=>{
		//socket.broadcast.emit('newMsg',socket.nickname,msg);
		//私发消息 _.findWhere(io.sockets.sockets,{nickname:'burt'}).emit();
		io.sockets.emit('newMsg',socket.nickname,msg);
	});
	//用户发广播图片消息
	socket.on('imgMsg',(addr)=>{
		io.sockets.emit('newImg',socket.nickname,addr);
	});
	//用户发广播的本地图片
	socket.on('mySelfImg',(addr)=>{
		socket.broadcast.emit('mySelfImg',addr);
	});
	
});


//后台接受的图片是base64编码字符串，要将其转换为图片
/****
var imgData = req.body.imgData; //接收前台POST过来的base64
//过滤data:URL
var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
var dataBuffer = new Buffer(base64Data, 'base64');
fs.writeFile("out.png", dataBuffer, function(err) {
	if(err){
	  res.send(err);
	}else{
	  res.send("保存成功！");
	}
});

****/