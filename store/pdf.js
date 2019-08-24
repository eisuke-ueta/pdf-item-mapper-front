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

const DEFAULT_SCALE = 1.5

export const state = () => ({
  pageRules: [],
  pageNumber: 0,
  pageRange: [],
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
  }
}

export const actions = {
  addPageRule({ state, commit }) {
    const newPageRule = cloneDeep(DEFAULT_PAGE_RULE)
    newPageRule.name = uuidv1()
    newPageRule.rule.pageNumber = state.pageNumber
    commit('addPageRule', { pageRule: newPageRule })
  },
  deletePageRule({ commit }, { pageRule }) {
    commit('deletePageRule', { pageRule: pageRule })
  },
  updatePageRule({ commit }, { pageRule }) {
    commit('updatePageRule', { pageRule: pageRule })
  },
  setPageNumber({ commit }, { pageNumber }) {
    commit('setPageNumber', { pageNumber: pageNumber })
  },
  setPageRange({ commit }, { pageRange }) {
    commit('setPageRange', { pageRange: pageRange })
  }
}
