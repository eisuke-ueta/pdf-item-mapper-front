import cloneDeep from 'lodash/cloneDeep'
const uuidv1 = require('uuid/v1')

export const DEFAULT_PAGE_RULE = {
  x: 50,
  y: 50,
  width: 100,
  height: 50,
  fill: 'green',
  name: 'rectangle',
  opacity: 0.3,
  draggable: true,
  rule: {
    itemType: 'HEADER',
    key: '',
    type: 'POSITION',
    pageNumber: 0,
    position: {
      top: 50,
      left: 50,
      width: 100,
      height: 50
    },
    onlyNumber: false,
    trim: true
  }
}

const DEFAULT_SCALE = 2.0

export const state = () => ({
  pageRules: [],
  pageNumber: 0,
  pageRange: [],
  detailSpec: {
    startPage: 1,
    pageRules: []
  },
  scale: DEFAULT_SCALE,
  scaleRate: DEFAULT_SCALE / 2.0
})

export const mutations = {
  setPageRules(state, { pageRules }) {
    state.pageRules = pageRules
  },
  addPageRule(state, { pageRule }) {
    state.pageRules.push(pageRule)
  },
  deletePageRule(state, { pageRule }) {
    state.pageRules = state.pageRules.filter(v => v.name !== pageRule.name)
  },
  updatePageRule(state, { pageRule }) {
    state.pageRules = state.pageRules.map(v => {
      return v.name === pageRule.name ? pageRule : v
    })
  },
  setPageNumber(state, { pageNumber }) {
    state.pageNumber = pageNumber
  },
  setPageRange(state, { pageRange }) {
    state.pageRange = pageRange
  },
  setDetailSpec(state, { detailSpec }) {
    state.detailSpec = detailSpec
  }
}

export const actions = {
  addDefaultPageRule({ state, commit }) {
    const newPageRule = cloneDeep(DEFAULT_PAGE_RULE)
    newPageRule.name = uuidv1()
    newPageRule.rule.pageNumber = state.pageNumber
    commit('addPageRule', { pageRule: newPageRule })
  },
  addPageRule({ state, commit }, { itemType, rule }) {
    const newPageRule = cloneDeep(DEFAULT_PAGE_RULE)
    newPageRule.name = uuidv1()
    newPageRule.rule = cloneDeep(rule)
    newPageRule.rule.itemType = itemType
    newPageRule.rule.onlyNumber = rule.onlyNumber ? rule.onlyNumber : false
    newPageRule.rule.trim = rule.trim ? rule.trim : true
    newPageRule.rule.pageNumber = rule.page - 1
    delete newPageRule.rule.page

    const position = cloneDeep(rule.position)
    newPageRule.x = Math.round(position.left * state.scaleRate)
    newPageRule.y = Math.round(position.top * state.scaleRate)
    newPageRule.width = Math.round(position.width * state.scaleRate)
    newPageRule.height = Math.round(position.height * state.scaleRate)

    commit('addPageRule', { pageRule: newPageRule })
  },
  deletePageRule({ commit }, { pageRule }) {
    commit('deletePageRule', { pageRule: pageRule })
  },
  updatePageRule({ commit }, { pageRule }) {
    commit('updatePageRule', { pageRule: pageRule })
  },
  initPageRules({ commit }) {
    commit('setPageRules', { pageRules: [] })
  },
  setPageNumber({ commit }, { pageNumber }) {
    commit('setPageNumber', { pageNumber: pageNumber })
  },
  setPageRange({ commit }, { pageRange }) {
    commit('setPageRange', { pageRange: pageRange })
  },
  updateDetailSpec({ commit }, { detailSpec }) {
    commit('setDetailSpec', { detailSpec: detailSpec })
  }
}
