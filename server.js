const express=require('express');
const app=express();
const server=require('http').createServer(app);
const io=require('socket.io').listen(server);

app.use(express.static('./src'));

server.listen(8082,(err)=>{
	if(err)
		throw err;
	else{
		console.log('成功监听8082端口');
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
		socket.broadcast.emit('newMsg',socket.nickname,msg);
	});
	//用户发广播图片消息
	socket.on('imgMsg',(addr)=>{
		io.sockets.emit('newImg',socket.nickname,addr);
	});

});