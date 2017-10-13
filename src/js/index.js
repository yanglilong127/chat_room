//添加表情
for(var i=1;i<=69; i++){
	var $li=`<li><img src="images/emoji/${i}.gif" alt=""></li>`;
	$('#biaoqing ul.emoit').append($($li));
	if(i==69){
		var ul_heigth=$('#biaoqing ul.emoit').height();
		$('#biaoqing ul.emoit').css({top:-ul_heigth});
	}
}

//点击表情
$('#biaoqing img.logo').click(function(e){
	e.stopPropagation();
	$('#biaoqing ul.emoit').slideToggle();
});
//点击选择图片
$('#biaoqing img.mytupian').click(function(e){
	e.stopPropagation();
	$('#mytupian').trigger('click');
});
$('#mytupian').click(function(e){
	e.stopPropagation();
});
$(document).click(function(){
	$('#biaoqing ul.emoit').fadeOut();
});

//当屏幕宽度小于700px时使之全屏
var winW=$(window).width();
if(winW<700){
	var winH=$(window).height();  //窗口高度
	var contentH=winH-106;  //内容区高度
	$('#content').height(contentH);
}
$(window).resize(function(){
	if($(window).width()<700){
		var winH=$(window).height();  //窗口高度
		var contentH=winH-106;  //内容区高度
		$('#content').height(contentH);
	}else{
		$('#content').height(590);
	}
});


//点击确认后
$('#conf').click(function(e){
	e.stopPropagation();
	var username=$('#zhezhao input.form-control').val().trim();
	if(!username){  //空的名字
		return;
	}


	//建立socket连接
	var socket =io.connect();
	socket.on('connect',()=>{
		socket.emit('login',username);
	});

	//用户名存在
	socket.on('nickname',()=>{
		$('#tips').text('用户名已存在').fadeIn().delay(2000).fadeOut();
	});

	//登录成功
	socket.on('loginSuccess',()=>{
		//聊天框显示
		$('#box').css({opacity:1});
		//遮罩层隐藏
		$('#zhezhao').fadeOut();

		//用户可以广播了
		$('#send').click(function(e){
			e.stopPropagation();
			var msg=$('#myMsg').val().trim();
			if(msg){  //有内容
				$('#myMsg').val('');
				socket.emit('msg',msg);
			}else{
				alert('输入不能为空');
			}
		});
		//用户可以广播表情图片了
		$('#biaoqing ul.emoit li').click(function(e){
			e.stopPropagation();
			var msg=$(this).find('img').attr('src');
			socket.emit('imgMsg',msg);
		});
		
		
		//用户可以发送本地图片了
		$('#mytupian').change(function(e){
			e.stopPropagation();
			var file=$(this).get(0).files[0];
			var arr=file.name.split('.');
			var ext=arr[arr.length-1].toLowerCase();  //后缀名
			if(ext!='png' && ext!='jpg' && ext!='jpeg' && ext!='gif'){  //如果不是图片
				alert('只能选择图片文件');
				return;
			};
			var reader=new FileReader();
			reader.readAsDataURL(file);
			reader.onloadstart=function(e){   //数据刚开始读取
				$('#content .progress').text('0%').fadeIn(1);
			}
			reader.onprogress=function(e){  //数据读取中触发
				var loaded=e.loaded/e.total;
				if(loaded <1){
					var loadedSize=parseInt(loaded*100)+'%';
					$('#content .progress').text(loadedSize);
				}else{
					$('#content .progress').text('100%').fadeOut();
				}
			}
			reader.onload=function(e){  //加载完成时触发
				//this.result为base64编码图片  或者e.target.result
				var nowTime=forMatDate(new Date());
				var $li=`<li class="mypic">
							<span class="from_who">${username}</span>
							(<span class="time">${nowTime}</span>):
							<img src="${this.result}" alt="">
						</li>`;
				$('#content ul.mycont').append($($li));
				slideD();
				socket.emit('mySelfImg',this.result);
			};
		});
		
	});

	//系统广播
	//参数1用户名
	//参数2 在线人数
	//参数3 登录还是离线
	socket.on('system',(username,nums,operation)=>{
		$('#box span.nums').text(nums);  //在线人数
		var nowTime=forMatDate(new Date());
		if(operation=='login'){
			operation='上线了';
		}else if(operation=='logout'){
			operation='离线了';
		}
		var $li=`<li class="message">
					<span class="from_who">${username}</span>
					<span class="time">(${nowTime}):</span>
					<span class="msg">${operation}</span>
				</li>`;
		$('#content ul.mycont').append($($li));
	});

	//接受用户的广播消息
	//参数1 为用户名
	//参数2 为消息内容
	socket.on('newMsg',(username,msg)=>{
		var nowTime=forMatDate(new Date());
		var $li=`<li class="message">
					<span class="from_who">${username}</span>
					(<span class="time">${nowTime}</span>):
					<span class="msg">${msg}</span>
				</li>`;
		$('#content ul.mycont').append($($li));
		slideD();
	});
	//接受用户的广播图片消息
	//参数1 为用户名
	//参数2 为图片地址
	socket.on('newImg',(username,addr)=>{
		var nowTime=forMatDate(new Date());
		var $li=`<li class="mypic">
					<span class="from_who">${username}</span>
					(<span class="time">${nowTime}</span>):
					<img src="${addr}" alt="">
				</li>`;
		$('#content ul.mycont').append($($li));
		slideD();
	});
	
	//用户接受广播的本地图片
	socket.on('mySelfImg',(msgAddr)=>{
		var nowTime=forMatDate(new Date());
		var $li=`<li class="mypic">
					<span class="from_who">${username}</span>
					(<span class="time">${nowTime}</span>):
					<img src="${msgAddr}" alt="">
				</li>`;
		$('#content ul.mycont').append($($li));
		slideD();
	});

	
});

//发消息时使到达最底端
function slideD(){
	var ulH=$('#content ul.mycont').height();  //内容里面ul高度
	var contentH=$('#content').height();   //内容高度
	if(ulH > contentH){
		$('#content').scrollTop(ulH-contentH);
	}
}






//将数字都转换为两位的
function num2double(number){
    number=(number.toString().length==2) ? number : ('0'+number);
    return number;
}

//将标准时间转换格式  08:20:08
function forMatDate(date){  //中国标准时间对象
    //var year=date.getFullYear();
    //var month=num2double(date.getMonth()+1);
    //var dat=num2double(date.getDate());
    var hours=num2double(date.getHours());
    var min=num2double(date.getMinutes());
    var sen=num2double(date.getSeconds());
    //date=year+'/'+month+'/'+dat+' '+hours+':'+min+':'+sen;
    date=hours+':'+min+':'+sen;
    return date;
}