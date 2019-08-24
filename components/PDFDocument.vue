<template lang="pug">
v-layout(column)
  v-flex(class="pdf-document" v-if="pages.length > 0")
    v-stage(ref="stage" :config="getActivePageConfig" class="annotation-layer" @mousedown="handleStageMouseDown")
      v-layer(ref="layer")
        v-rect(
          v-for="pageRule in getActivePageRules" 
          :key="pageRule.name" 
          :config="pageRule" 
          @click="handleRectClick"
          @dragend="handleDragEnd"
          @transformend="handleTransformEnd"
        )
        v-transformer(ref="transformer")
    PDFPage.elevation-1(
        v-bind="{scale}"
        :page="getActivePage"
        :key="pageNumber"
      )
</template>
<script>
import cloneDeep from 'lodash/cloneDeep'
import { mapActions, mapState } from 'vuex'
import range from 'lodash/range'
import PDFPage from '@/components/PDFPage'

export default {
  components: {
    PDFPage
  },
  props: {
    url: {
      type: String,
      required: true
    },
    scale: {
      type: Number,
      default: 1.0
    }
  },

  data() {
    return {
      pdf: null,
      pages: [],
      selectedShapeName: ''
    }
  },

  computed: {
    getActivePage() {
      return this.pages[this.pageNumber]
    },
    getActivePageConfig() {
      return this.pages[this.pageNumber].stageSize
    },
    getActivePageRules() {
      return this.pageRules.filter(pageRule => {
        return pageRule.rule.pageNumber === this.pageNumber
      })
    },
    ...mapState('pdf', {
      pageNumber: state => state.pageNumber,
      pageRules: state => state.pageRules
    })
  },

  async created() {
    await this.initPDF()
    await this.initPages()
  },

  methods: {
    async initPDF() {
      this.pdf = await import('pdfjs-dist/webpack').then(pdfjs =>
        pdfjs.getDocument(this.url)
      )
    },
    async initPages() {
      const pageRange = range(0, this.pdf.numPages)

      // init pages
      const promises = pageRange.map(number => this.pdf.getPage(number + 1))
      await Promise.all(promises).then(pages => {
        this.pages = pages.map(page => {
          // set stage size for annotation
          page.stageSize = {
            width: page.view[2],
            height: page.view[3]
          }
          return page
        })
      })
      // set page ranges
      this.setPageRange({ pageRange: pageRange })
    },
    handleRectClick(e) {},
    handleDragEnd(e) {
      const pageRule = cloneDeep(e.target.attrs)
      pageRule.rule.position.top = Math.round(pageRule.y)
      pageRule.rule.position.left = Math.round(pageRule.x)
      pageRule.rule.position.height = Math.round(
        pageRule.height * pageRule.scaleY
      )
      pageRule.rule.position.width = Math.round(
        pageRule.width * pageRule.scaleX
      )
      this.updatePageRule({ pageRule: pageRule })
    },
    handleTransformEnd(e) {
      const pageRule = cloneDeep(e.target.attrs)
      pageRule.rule.position.top = Math.round(pageRule.y)
      pageRule.rule.position.left = Math.round(pageRule.x)
      pageRule.rule.position.height = Math.round(
        pageRule.height * pageRule.scaleY
      )
      pageRule.rule.position.width = Math.round(
        pageRule.width * pageRule.scaleX
      )
      this.updatePageRule({ pageRule: pageRule })
    },
    handleStageMouseDown(e) {
      // clicked on stage - clear selection
      if (e.target === e.target.getStage()) {
        this.selectedShapeName = ''
        this.updateTransformer()
        return
      }

      // clicked on transformer - do nothing
      const clickedOnTransformer =
        e.target.getParent().className === 'Transformer'
      if (clickedOnTransformer) return

      // find clicked rect by its name
      const name = e.target.name()
      const rect = this.pageRules.find(r => r.name === name)
      this.selectedShapeName = rect ? name : ''
      this.updateTransformer()
    },
    updateTransformer() {
      // here we need to manually attach or detach Transformer node
      const transformerNode = this.$refs.transformer.getStage()
      const stage = transformerNode.getStage()
      const { selectedShapeName } = this

      const selectedNode = stage.findOne('.' + selectedShapeName)
      if (selectedNode === transformerNode.node()) return

      if (selectedNode) {
        transformerNode.attachTo(selectedNode)
      } else {
        transformerNode.detach()
      }
      transformerNode.getLayer().batchDraw()
    },
    ...mapActions('pdf', ['setPageNumber', 'setPageRange', 'updatePageRule'])
  }
}
</script>
<style>
.annotation-layer {
  position: absolute;
}
</style>
