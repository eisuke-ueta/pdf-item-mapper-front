<script>
export default {
  props: {
    page: {
      type: Object,
      default: () => {}
    },
    scale: {
      type: Number,
      default: 1.0
    }
  },

  computed: {
    actualSizeViewport() {
      return this.viewport.clone({ scale: this.scale })
    },

    canvasStyle() {
      const {
        width: actualSizeWidth,
        height: actualSizeHeight
      } = this.actualSizeViewport
      const pixelRatio = window.devicePixelRatio || 1
      const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight].map(
        dim => Math.ceil(dim / pixelRatio)
      )
      return `width: ${pixelWidth}px; height: ${pixelHeight}px;`
    },

    canvasAttrs() {
      let { width, height } = this.viewport
      ;[width, height] = [width, height].map(dim => Math.ceil(dim))

      const style = this.canvasStyle

      return {
        width,
        height,
        style
      }
    },

    pageNumber() {
      return this.page.pageNumber
    }
  },

  watch: {
    page(page, oldPage) {
      this.destroyPage(oldPage)
    }
  },

  created() {
    // PDFPageProxy#getViewport
    // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
    this.viewport = this.page.getViewport(this.scale)
  },

  mounted() {
    this.renderPage()
  },

  beforeDestroy() {
    this.destroyPage(this.page)
  },

  methods: {
    // https://mozilla.github.io/pdf.js/api/draft/
    renderPage() {
      this.renderTask = this.page.render(this.getRenderContext())
      this.renderTask.then(() => this.$emit('rendered', this.page))
    },

    destroyPage(page) {
      if (!page) return

      // comment out to enable re-render page
      // page._destroy()

      if (this.renderTask) this.renderTask.cancel()
    },

    getRenderContext() {
      const { viewport } = this
      const canvasContext = this.$el.getContext('2d')

      return { canvasContext, viewport }
    }
  },

  render(h) {
    const { canvasAttrs: attrs } = this
    return h('canvas', { attrs })
  }
}
</script>
<style></style>
