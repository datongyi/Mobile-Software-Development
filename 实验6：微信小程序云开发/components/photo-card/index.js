Component({
  properties: { photo: { type: Object, value: {} } },
  methods: {
    tapAuthor() { this.triggerEvent('author', this.data.photo); },
    tapDetail() { this.triggerEvent('detail', this.data.photo); },
  },
});

