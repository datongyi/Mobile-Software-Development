Component({
  properties: { photo: { type: Object, value: {} } },
  data: { imageError: false, avatarError: false },
  observers: { 'photo': function () { this.setData({ imageError: false, avatarError: false }); } },
  methods: {
    onImageError() { this.setData({ imageError: true }); },
    onAvatarError() { this.setData({ avatarError: true }); },
    tapAuthor() { this.triggerEvent('author', this.data.photo); },
    tapDetail() { this.triggerEvent('detail', this.data.photo); },
  },
});
