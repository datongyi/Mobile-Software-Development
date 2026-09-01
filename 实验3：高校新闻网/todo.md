### 三、视图设计

#### 3.1 导航栏设计

在**app.json**中修改window属性配置导航栏效果，修改了导航栏的颜色，标题以及标题颜色。



```
    "window": {
        "navigationBarBackgroundColor": "#328EEB",
        "navigationBarTitleText": "我的新闻网",
        "navigationBarTextStyle":"white"
    }
```

#### 3.2 tabBar设计

在**app.json**中启用`tabBar`，同时引用`images`文件夹中的图片素材，在`tabBar`可以点击`首页`和`我的`图标，切换至对应的页面，同时改变显示的图标。



```
 "tabBar": {
    "color": "#000000",
    "selectedColor": "#328EEB",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/index1.png",
        "selectedIconPath": "images/index2.png"
      },
      {
        "pagePath": "pages/my/my",
        "text": "我的",
        "iconPath": "images/my1.png",
        "selectedIconPath": "images/my2.png"
      }
    ]
  }
```

#### 3.3 首页设计

首页包含两部分内容，分别是幻灯片滚动和新闻列表，使用`<swiper>`组件和`<view>`容器。

1. 轮播组件 (swiper):



```
- 使用 `<swiper>` 标签创建一个轮播组件。
- `indicator-dots="true"` 表示显示轮播指示点。
- `autoplay="true"` 表示自动播放。
- `interval="5000"` 设置自动播放的间隔时间为 5000 毫秒（5 秒）。
- `duration="500"` 设置滑动动画的持续时间为 500 毫秒。
- 使用 `<view wx:for="{{swiperImg}}" wx:key="swiper{{index}}">` 循环遍历 `swiperImg` 数组，生成多个 `<swiper-item>`。
- 每个 `<swiper-item>` 包含一个 `<image>` 标签，用于显示图片。
```

1. 新闻列表 (news-list):



```
- 使用 `<view class="news-list">` 创建一个新闻列表的容器。
- 使用 `<view class="news-item" wx:for="{{newsList}}" wx:key="{{item.id}}">` 循环遍历 `newsList` 数组，生成多个新闻项。
- 每个新闻项包含一个 `<image>` 标签，用于显示新闻的海报图片。
- 每个新闻项还包含一个 `<text>` 标签，显示新闻标题和添加日期，并绑定点击事件 `bindtap='goToDetail'`，点击时会调用 `goToDetail` 方法，并传递新闻项的 `id`。
```

注意，`swiperImg` 和 `newsList` 是数据源，应该在页面的 JavaScript 文件中定义和赋值。

**index.wxml**文件代码：



```
<!-- 幻灯片 -->
<swiper indicator-dots="true" autoplay="true" interval="5000" duration="500">
  <view wx:for="{{swiperImg}}" wx:key="swiper{{index}}">
    <swiper-item>
      <image src="{{item.src}}"></image>
    </swiper-item>
  </view>
</swiper>
<!-- 新闻列表 -->
<view class="news-list">
  <view class="news-item" wx:for="{{newsList}}" wx:key="{{item.id}}" >
    <image src="{{item.poster}}" ></image>
    <text bindtap = 'goToDetail' data-id="{{item.id}}">{{item.title}}————{{item.add_date}}</text>
  </view>
</view>
 **index.wxss**文件代码：
```



```
/* 幻灯片部分 */
swiper{
  height: 400rpx;
  width:100%;
}
swiper image{
  height: 100%;
  width:100%;
}
```

后续在个人中心页也会用到新闻列表，所以将这部分样式写在公共样式表**app.wxss**中重复利用，作为全局样式。

**app.wxss**文件代码：



```
/* 新闻列表 */
.news-list{
  min-height: 600rpx;
  padding: 15rpx;
}
.news-item{
  display: flex;
  flex-direction: row;
  border-bottom:1rpx solid black;
}
.news-item image{
  height: 150rpx;
  width: 230rpx;
  margin: 10rpx;
}
.news-item text{
  width:100%;
  line-height: 60rpx;
  font-size:40rpx;
}
```

#### 3.4 个人中心页设计

个人中心页包含两部分，登录页面和收藏列表，使用`<view>`容器。

这段代码是一个微信小程序的页面布局，包含登录页面和收藏列表。以下是详细描述：

1. 登录页面 (myLogin):



```
- 使用 `<view class="myLogin">` 创建一个登录页面的容器。
- 使用 `<block wx:if="{{isLogin}}">`判断用户是否已登录。
- 如果已登录，显示用户头像和昵称。
- 如果未登录，显示登录按钮，并绑定点击事件 `bindtap="getUserInfo"`，点击时会调用 `getUserInfo` 方法。
```

1. 收藏列表 (myFavorite):



```
- 使用 `<view class="myFavorite">` 创建一个收藏列表的容器。
- `<text>我的收藏（{{number}}）</text>` 显示收藏的数量。
- 使用` <view class="news-list">`创建一个新闻列表的容器。
- 使用 for循环`newsList` 数组，生成多个新闻项。
- 每个新闻项包含一个 `<image>` 标签，用于显示新闻的海报图片。
- 每个新闻项还包含一个 `<text>` 标签，显示新闻标题和添加日期，并绑定点击事件 `bindtap='goToDetail'`，点击时会调用 `goToDetail` 方法，并传递新闻项的 `id`。
```

注意，`isLogin`、`src`、`nickName`、`number` 和 `newsList` 是数据源，应该在页面的 JavaScript 文件中定义和赋值。

**my.wxml**文件代码：



```
<!-- 登陆页面 -->
<view class="myLogin">
  <block wx:if="{{isLogin}}">
    <image src="{{src}}"></image>
    <text>{{nickName}}</text>
  </block>
  <button wx:else bindtap="getUserInfo" >未登录，点此登录</button>
</view>
<!-- 收藏列表 -->
<view class="myFavorite"> 
  <text>我的收藏（{{number}}）</text>
  <view class="news-list">
    <view class="news-item" wx:for="{{newsList}}" wx:key="{{item.id}}">
      <image src="{{item.poster}}"></image>
      <text bindtap = 'goToDetail' data-id="{{item.id}}">{{item.title}}————{{item.add_date}}</text>
    </view>
  </view>
</view>
```

**my.wxss**文件代码：



```
/* 登陆页面 */
.myLogin{
  height: 400rpx;
  background-color: #328EEB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}
.myLogin image{
  height: 200rpx;
  width:200rpx;
  border-radius: 50%;
}
.myLogin text{
  color: white;
}
/* 收藏列表 */
.myFavorite{
  padding: 20rpx;
}
```

#### 3.5 新闻页设计

新闻页用于显示文章的详细信息，并提供收藏和取消收藏的功能。



```
1. 容器 (container):
   - 使用 `<view class="container">` 创建一个容器，包含文章的所有内容。
2. 标题 (title):
   - 使用 `<view class="title">{{article.title}}</view>` 显示文章的标题，`{{article.title}}` 是数据绑定，显示 `article` 对象中的 `title` 属性。
3. 海报 (poster):
   - 使用 `<view class="poster">` 创建一个容器，包含文章的海报图片。
   - `<image src="{{article.poster}}"></image>` 显示文章的海报图片，`{{article.poster}}` 是数据绑定，显示 `article` 对象中的 `poster` 属性。
4. 内容 (content):
   - 使用 `<view class="content">` 创建一个容器，包含文章的内容。
   - `<text>{{article.content}}</text>` 显示文章的内容，`{{article.content}}` 是数据绑定，显示 `article` 对象中的 `content` 属性。
5. 添加日期 (add_date):
   - 使用 `<view class="add_date">{{article.add_date}}</view>` 显示文章的添加日期，`{{article.add_date}}` 是数据绑定，显示 `article` 对象中的 `add_date` 属性。
6. 收藏按钮:
   - 使用 `<button wx:if='{{isAdd}}' plain bindtap="cancelFavorites">❤️已收藏</button>` 判断是否已收藏，如果已收藏，显示“已收藏”按钮，并绑定点击事件 `bindtap="cancelFavorites"`，点击时会调用 `cancelFavorites` 方法。
   - 使用 `<button wx:else plain bindtap="addFavorites">❤️未收藏</button>` 如果未收藏，显示“未收藏”按钮，并绑定点击事件 `bindtap="addFavorites"`，点击时会调用 `addFavorites` 方法。
```

注意，`article` 和 `isAdd` 是数据源，应该在页面的 JavaScript 文件中定义和赋值。

**detail.wxml**文件代码：



```
<view class="container">
  <view class="title">{{article.title}}</view>
  <view class="poster">
    <image src="{{article.poster}}"></image>
  </view>
  <view class="content">
    <text>{{article.content}}</text>
  </view>
  <view class="add_date">{{article.add_date}}</view>
  <button wx:if = '{{isAdd}}' plain bindtap="cancelFavorites">❤️已收藏</button>
  <button wx:else plain bindtap = "addFavorites">❤️未收藏</button>
</view>
```

**detail.wxss**文件代码：



```
.container{
  padding:15rpx;
  /* text-align: center; */
}
.title{
  font-size: 35rpx;
  line-height: 35rpx;
  text-align: center;
}
.poster image{
  width: 100%;
}
.content text{
  text-align: left;
  font-size: 30rpx;
  line-height: 35rpx;
}
.add_date{
  font-size: 30rpx;
  text-align: right;
  line-height: 30rpx;
  margin-right: 25rpx;
  margin-top:20rpx;
}
button{
  width: 250rpx;
  height:100rpx;
  margin:20rpx auto;
}
```

### 四、逻辑实现

在各个页面的js文件顶端引用js文件，作用为使用**common.js**文件



```
var common = require('../../utils/common.js')
```

#### 4.1 首页逻辑

##### (1)新闻列表获取

在首页加载时获取新闻列表数据，并将其设置到页面的数据属性中，以便在页面上显示新闻列表。新闻存储在newList变量中，因此在加载首页时（即启动onLoad函数）获取新闻，并赋值给newList。

**index.js**文件部分代码：



```
 /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let list = common.getNewList()
    this.setData({
      newsList:list
    })
  },
```

##### (2)点击新闻跳转详情

在**index.wxml**中绑定点击事件 `bindtap='goToDetail'`，点击时会调用 `goToDetail` 方法，并传递新闻项的 `id`。



```
<!-- 新闻列表 -->
<view class="news-list">
  <view class="news-item" wx:for="{{newsList}}" wx:key="{{item.id}}" >
    <image src="{{item.poster}}" ></image>
    <text bindtap = 'goToDetail' data-id="{{item.id}}">{{item.title}}————{{item.add_date}}</text>
  </view>
</view>
```

在**index.js**中定义goToDetail点击事件函数：



```
  goToDetail:function(e){
    //获取携带data-id的数据
    let id = e.currentTarget.dataset.id
    //console.log(e)
    //携带新闻ID进行页面跳转
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
    })

  },
```

#### 4.2新闻页逻辑

##### (1) 显示对应新闻

在新闻页加载时检查新闻是否已被收藏，并根据检查结果更新页面的数据属性，以便在页面上显示相应id的新闻内容和收藏状态。



```
- `onLoad: function (options)` 定义了页面加载时的回调函数。`options` 参数包含打开当前页面路径中的参数。
- `let id = options.id` 获取传递过来的新闻 `id`。

- `var newarticle = wx.getStorageSync(id)` 从本地存储中获取对应 `id` 的新闻数据。
- 如果新闻已存在于收藏夹中 (newarticle != '')，则更新页面数据：`this.setData({ isAdd: true, article: newarticle })` 设置 `isAdd` 为 `true`，并将新闻数据 `newarticle` 设置到页面的数据属性 `article` 中。
- 如果新闻不存在于收藏夹中，则从服务器获取新闻详情。
- `let result = common.getNewsDetail(id)` 调用 `common` 模块中的 `getNewsDetail` 方法获取新闻详情。
- 如果获取成功 (result.code == '200')，则更新页面数据：`this.setData({ article: result.news, isAdd: false })` 设置 `isAdd` 为 `false`，并将新闻数据 `result.news` 设置到页面的数据属性 `article` 中。
```

**detail.js**文件部分代码：



```
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id

    //检查当前新闻是否在收藏夹中
    var newarticle = wx.getStorageSync(id)
    //已存在
    if( newarticle != '' ){
      this.setData({
        isAdd:true,
        article:newarticle
      })
    }
    //不存在
    else{
      let result = common.getNewsDetail(id)
      //获取新闻内容
      if( result.code == '200' ){
        this.setData({
          article:result.news,
          isAdd:false
        })
      }
    }
    
    },
```

##### (2) 添加/取消新闻收藏

在**detail.wxml**文件中的两个`<button>`组件作为添加/取消新闻收藏按钮，根据文章是否已被收藏，动态显示“已收藏”或“点击收藏”按钮，并处理相应的点击事件。



```
  <button wx:if = '{{isAdd}}' plain bindtap="cancelFavorites">❤️已收藏</button>
  <button wx:else plain bindtap = "addFavorites">❤️未收藏</button>
```

在**detail.js**中添加addFavorites和cancleFavorites事件函数，通过本地存储来保存和移除收藏的文章数据，并更新页面的收藏状态。用`wx.getStorageSync(id)`返回值判断是否已经收藏当前新闻。



```
  //添加收藏
  addFavorites:function(){
    let article = this.data.article
    wx.setStorageSync(article.id, article)
    this.setData({
      isAdd:true
    })
  },
  //取消收藏
  cancelFavorites:function(){
    let article = this.data.article
    wx.removeStorageSync(article.id)
    this.setData({
      isAdd:false
    })
  },
```

#### 4.3个人主页逻辑

##### (1) 获取微信用户信息

根据用户的登录状态动态显示用户信息或登录按钮。在**my.wxml**文件中，添加组件作为登录按钮，并使用wx:if和wx:else属性让未登录时只显示按钮，登陆后只显示头像和昵称。



```
<!-- 登陆页面 -->
<view class="myLogin">
  <block wx:if="{{isLogin}}">
    <image src="{{src}}"></image>
    <text>{{nickName}}</text>
  </block>
  <button wx:else bindtap="getUserInfo" >未登录，点此登录</button>
</view>
```

在**my.js**文件中，通过调用微信小程序的 `getUserProfile` 方法获取用户的个人信息，并更新页面的数据属性以显示用户的头像和昵称。



```
// 获取个人信息
  getUserInfo(){
    let that = this
    wx.getUserProfile({
      desc: 'desc',
      success(res){
          console.log(res.userInfo)//这里可以在控制台输出用户信息
          res = res.userInfo
            that.setData({
                isLogin : true,
                src : res.avatarUrl,//设置用户头像
                nickName : res.nickName//设置用户昵称
            })
      }
    })
  },
```

##### (2) 获取收藏列表

需要获取用户的收藏新闻列表并更新页面的数据属性，以便在页面上显示收藏的新闻和数量。

在**my.js**中添加getMyFavorites函数，用于展示真正的新闻收藏列表。



```
1. **获取本地缓存信息**:
   - `let info = wx.getStorageInfoSync()` 读取本地缓存信息。
   - `let keys = info.keys` 获取所有缓存的键。
   - `let num = keys.length` 获取收藏新闻的数量。
2. **获取收藏的新闻列表**:
   - 创建一个空数组 `let myList = []` 用于存储收藏的新闻。
   - 使用for循环遍历所有键，获取对应的缓存数据并添加到myList数组中：
     - `let obj = wx.getStorageSync(keys[i])` 获取每个键对应的缓存数据。
     - `myList.push(obj)` 将数据添加到 `myList` 数组中。
3. **更新页面数据**:
   - 更新页面的数据属性：
   - `newsList` 设置为收藏的新闻列表 `myList`。
   - `number` 设置为收藏的新闻数量 `num`。
```

**my.js**部分代码：



```
  //更新number
  getMyFavorites:function(){
    let info = wx.getStorageInfoSync()  //读取本地缓存信息
    let keys = info.keys    //获取全部key信息 
    let num = keys.length   //获取收藏新闻数量
    
    let myList = [];
    for( var i = 0; i < num; i++ ){
      let obj = wx.getStorageSync(keys[i])
      myList.push(obj)
    }
    //更新收藏列表
    this.setData({
      newsList:myList,
      number:num
    })
  },
```

**my.js**文件中的onShow函数在页面显示时检查用户的登录状态，并在已登录的情况下获取用户的收藏列表。



```
  onShow: function () {
    if( this.data.isLogin ){
      this.getMyFavorites()
    }
  },
```

##### (3) 浏览收藏的新闻

在**my.wxml**文件中绑定点击事件 `bindtap='goToDetail'`，点击时会调用 `goToDetail` 方法，并传递新闻项的 `id`。



```
<!-- 收藏列表 -->
<view class="myFavorite"> 
  <text>我的收藏（{{number}}）</text>
  <view class="news-list">
    <view class="news-item" wx:for="{{newsList}}" wx:key="{{item.id}}">
      <image src="{{item.poster}}"></image>
      <text bindtap = 'goToDetail' data-id="{{item.id}}">{{item.title}}————{{item.add_date}}</text>
    </view>
  </view>
</view>
```

在**my.js**中编写gotoDetail函数实现页面跳转，使用 `wx.navigateTo` 方法进行页面跳转，并将新闻项的 `id` 作为参数传递给目标页面 `../detail/detail`。



```
  goToDetail: function (e) {
    //获取携带data-id的数据
    let id = e.currentTarget.dataset.id
    //console.log(e)
    //携带新闻ID进行页面跳转
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
    })
  },
```