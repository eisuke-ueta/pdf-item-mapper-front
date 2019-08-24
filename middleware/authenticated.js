export default context => {
  if (!context.store.state.auth.currentUser) context.redirect('/')
}
