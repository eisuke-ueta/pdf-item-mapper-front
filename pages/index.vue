<template lang="pug">
v-container(fluid fill-height)
  v-layout.mt-3(v-if="!url" justify-center align-center)
    v-flex(xs12 sm6 md4)
      v-file-input(label="Upload PDF file here." accept="application/pdf" outlined v-model="file" @change="onFileChange")
  v-layout.mt-3(v-if="url" justify-center)
    v-flex.mr-3
      PDFDocument(v-bind="{url, scale}")
    v-flex.white.elevation-1(xs12)
      v-container
        v-layout.mb-3(v-if="pageRange" align-center)
          v-select.mr-3(
            dense
            :items="getPageRange" 
            :value="getPageRange[pageNumber]"
            item-text="text"
            item-value="value"
            label="Current Page"
            @change="onChangeSelectedPage"
            )
          v-btn.primary.mr-2(@click="addPageRule" small) Add Rule
          v-dialog(v-model="exportDialog" max-width="800px")
            template(v-slot:activator="{ on }")
              v-btn.mr-0(small v-on="on") Export
            v-card
              v-card-title
                span.headline Export Settings
              v-card-text
                v-container
                  v-textarea(label="JSON" :value="getFormattedPageRules" filled readonly rows="20")
              v-card-actions
                v-container
                  v-layout
                    v-spacer
                    v-btn(small @click="exportDialog = false") Cancel
                    v-btn.primary(small @click="handleExport") Export
        v-layout
          v-flex(x12)
            v-card
              v-card-title
                v-spacer
                v-text-field(
                  v-model="search"
                  append-icon="search"
                  label="Keyword"
                  single-line
                  hide-details
                )
              v-data-table(
                :headers="headers"
                :items="getActivePageRules"
                :search="search"
              )
                template(v-slot:item.rule.position="{ item }")
                  span {{ getPosition(item.rule.position) }}
                template(v-slot:item.action="{ item }")
                  v-icon.mr-2(small @click="handleEdit(item)") edit
                  v-icon(small @click="handleDelete(item)") delete

  v-dialog(v-model="editDialog" max-width="600px")
    v-card
      v-card-title
        span.headline Edit Rule
      v-card-text
        v-container
          v-row(v-if="editPageRule.rule")
            v-col(cols="12" sm="6")
              v-text-field(label="Item Type" v-model="editPageRule.rule.itemType" disabled)
            v-col(cols="12" sm="6")
              v-text-field(label="Type" v-model="editPageRule.rule.type" disabled)
            v-col(cols="12" sm="6")
              v-text-field(label="Key" v-model="editPageRule.rule.key")
            v-col(cols="12" sm="6")
              v-text-field(label="Position" :value="getPosition(editPageRule.rule.position)" disabled)
            v-col(cols="12" sm="6")
              v-switch(v-model="editPageRule.rule.onlyNumber" label="Only Number")
            v-col(cols="12" sm="6")
              v-switch(v-model="editPageRule.rule.trim" label="Trim")
      v-card-actions
        v-container
          v-layout
            v-spacer
            v-btn(small @click="editDialog = false") Cancel
            v-btn.primary(small @click="handleSave(item)") Save
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import { mapActions, mapState } from 'vuex'
import PDFDocument from '@/components/PDFDocument'

export default {
  middleware: 'notAuthenticated',
  components: {
    PDFDocument
  },
  head() {
    return {
      title: 'New | Annotaion'
    }
  },
  data() {
    return {
      file: null,
      url: '',
      exportDialog: false,
      editDialog: false,
      editPageRule: {},
      search: '',
      headers: [
        { text: 'Type', value: 'rule.type' },
        { text: 'Key', value: 'rule.key' },
        { text: 'Position', value: 'rule.position' },
        { text: 'Actions', value: 'action' }
      ]
    }
  },
  computed: {
    getFormattedPageRules() {
      const config = this.convertPageRulesToConfig()
      return JSON.stringify(config, null, 4)
    },
    getPageRange() {
      return this.pageRange.map(number => {
        return { text: 'Page' + (number + 1), value: number }
      })
    },
    getActivePageRules() {
      return this.pageRules.filter(pageRule => {
        return pageRule.rule.pageNumber === this.pageNumber
      })
    },
    ...mapState('pdf', {
      pageRules: state => state.pageRules,
      pageNumber: state => state.pageNumber,
      pageRange: state => state.pageRange,
      scale: state => state.scale
    })
  },
  methods: {
    onFileChange(fileObject) {
      const objectURL = window.URL.createObjectURL(fileObject)
      this.url = objectURL
    },
    getPosition(position) {
      return (
        position.left +
        ', ' +
        position.top +
        ', ' +
        position.width +
        ', ' +
        position.height
      )
    },
    convertPageRulesToConfig() {
      const headerRules = this.pageRules.map(pageRule => {
        return {
          key: pageRule.rule.key,
          type: pageRule.rule.type,
          page: pageRule.rule.pageNumber + 1,
          position: {
            left: pageRule.rule.position.left,
            top: pageRule.rule.position.top,
            width: pageRule.rule.position.width,
            height: pageRule.rule.position.height
          },
          onlyNumber: pageRule.rule.onlyNumber,
          trim: pageRule.rule.trim
        }
      })
      const config = {
        headerSpec: {
          rules: headerRules
        },
        detailSpec: {
          startPage: 1,
          pageRules: []
        }
      }
      return config
    },
    handleExport() {
      const config = this.convertPageRulesToConfig()
      const blob = new Blob([JSON.stringify(config, null, 4)], {
        type: 'application/json'
      })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'setting.json'
      link.click()
      this.exportDialog = false
    },
    handleEdit(item) {
      this.editPageRule = cloneDeep(item)
      this.editDialog = true
    },
    handleSave() {
      this.updatePageRule({ pageRule: this.editPageRule })
      this.editPageRule = {}
      this.editDialog = false
    },
    handleDelete(item) {
      this.deletePageRule({ pageRule: item })
    },
    addPageRule() {
      this.addPageRule()
    },
    onChangeSelectedPage(value) {
      this.setPageNumber({ pageNumber: value })
    },
    ...mapActions('pdf', [
      'addPageRule',
      'deletePageRule',
      'updatePageRule',
      'setPageNumber'
    ])
  }
}
</script>
<style scoped></style>
