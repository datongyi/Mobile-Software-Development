Page({
  data: {
    wording: 'world',
    showImg: true
  },
  
  onInput: function (e) {
    let inputValue = e.detail.value;
    // 如果清空输入框，退回默认的 world
    if (inputValue === '') {
      inputValue = 'world';
    }
    this.setData({
      wording: inputValue
    })
  },

  onClick: function () {
    let currentWording = this.data.wording;
    if (currentWording === 'world') {
      this.setData({
        wording: 'boy'
      })
    } else {
      this.setData({
        wording: 'world'
      })
    }
  },

  toggleImg: function () {
    this.setData({
      showImg: !this.data.showImg
    })
  }
})