export const state = () => ({
  currentUser: null,
  token: null
})

export const mutations = {
  setCurrentUser(state, { currentUser }) {
    state.currentUser = currentUser
  },
  setToken(state, { token }) {
    state.token = token
  }
}

export const actions = {}
