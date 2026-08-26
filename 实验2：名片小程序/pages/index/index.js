Page({
  data: {
    navHeight: 0,
    navTop: 0,
    isScrolled: false,
    theme: 'system', 
    
    isExpanded: false, 
    currentTab: 0,
    slideDirection: '', 
    
    profile: {
      name: "周唯", 
      title: "计算机科学与技术 · 本科生",
      school: "中国海洋大学",
      enrollmentYear: "2024级",
      github: "https://github.com/datongyi", 
      email: "tongyi@stu.ouc.edu.cn",
      phone: "18384133445", 
      intro: "我是中国海洋计算机科学与技术专业的本科生，关注深度学习、agent应用，注重计算机基础素养。想要在可见的人机交互变革中至少做到顺应时代。",
      
      tabs: [
        {
          id: 0,
          title: "算法竞赛",
          content: "活跃于各大算法平台，常驻洛谷与LeetCode。熟练掌握图论、动规与贪心算法，较好掌握C/C++，参加天梯赛、计挑等竞赛获得省级、国家级奖项。"
        },
        {
          id: 1,
          title: "深度学习",
          content: "正在进行方言特征提取工作，并积极探索自己的整套skill和工作流，希望能极大提升各方面效率。"
        },
        {
          id: 2,
          title: "保研规划",
          content: "目标明确，持续打磨专业课基础、竞赛成果与科研项目经历。注重计算机网络、操作系统及算法设计修养，同时积极探索语音信号处理与声学特征等课题。"
        }
      ]
    }
  },

  touchStartX: 0,

  onLoad() {
    this.initCustomNav();
  },

  initCustomNav() {
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    const navTop = systemInfo.statusBarHeight;
    const navHeight = menuButtonInfo.height + (menuButtonInfo.top - systemInfo.statusBarHeight) * 2;
    this.setData({ navTop, navHeight: navHeight + navTop });
  },

  onPageScroll(e) {
    if (e.scrollTop > 50 && !this.data.isScrolled) {
      this.setData({ isScrolled: true });
    } else if (e.scrollTop <= 50 && this.data.isScrolled) {
      this.setData({ isScrolled: false });
    }
  },

  toggleTheme() {
    const themes = ['system', 'light', 'dark'];
    const nextTheme = themes[(themes.indexOf(this.data.theme) + 1) % themes.length];
    this.setData({ theme: nextTheme });
    let toastStr = nextTheme === 'system' ? '跟随系统' : (nextTheme === 'dark' ? '已切为夜间' : '已切为日间');
    wx.showToast({ title: toastStr, icon: 'none' });
  },

  toggleExpand() {
    this.setData({ isExpanded: !this.data.isExpanded });
  },

  switchTab(e) {
    this.changeTabTo(e.currentTarget.dataset.index);
  },

  onTouchStart(e) {
    this.touchStartX = e.changedTouches[0].clientX;
  },

  onTouchEnd(e) {
    const diff = e.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(diff) > 50) { 
      let nextIndex = this.data.currentTab;
      if (diff > 0 && this.data.currentTab > 0) nextIndex--;
      else if (diff < 0 && this.data.currentTab < this.data.profile.tabs.length - 1) nextIndex++;
      
      if (nextIndex !== this.data.currentTab) {
        this.changeTabTo(nextIndex);
      }
    }
  },

  changeTabTo(index) {
    if (this.data.currentTab === index) return;

    this.setData({ slideDirection: '' });
    setTimeout(() => {
      this.setData({
        currentTab: index,
        slideDirection: 'anim-fade-in' 
      });
    }, 50);
  },

  copyIntro() {
    wx.setClipboardData({
      data: this.data.profile.intro,
      success: () => wx.showToast({ title: '简介已复制', icon: 'success' })
    });
  },

  copyText(e) {
    const text = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '内容已复制', icon: 'success' })
    });
  },

  saveContact() {
    const { profile } = this.data;
    wx.addPhoneContact({
      firstName: profile.name,
      mobilePhoneNumber: profile.phone,
      organization: profile.school,
      title: profile.title,
      email: profile.email,
      url: profile.github,
      success() { wx.showToast({ title: '已存入通讯录', icon: 'success' }); }
    });
  },

  previewResume() {
    wx.showLoading({ title: '加载简历中...' });
    
    const resumeUrl = "https://raw.githubusercontent.com/Olivia-183/photos/main/简历.pdf"; 
    
    wx.downloadFile({
      url: resumeUrl,
      success: function (res) {
        wx.openDocument({
          filePath: res.tempFilePath,
          fileType: 'pdf', 
          success: () => wx.hideLoading(),
          fail: () => { wx.hideLoading(); wx.showToast({ title: '打开失败', icon: 'error' }); }
        });
      },
      fail: () => { wx.hideLoading(); wx.showToast({ title: '网络超时', icon: 'error' }); }
    });
  },

  onShareAppMessage() {
    return {
      title: `您好，我是 ${this.data.profile.school} 的 ${this.data.profile.name}，这是我的名片`,
      path: '/pages/index/index'
    };
  }
})