<template lang="pug">
v-app
  v-app-bar.primary(dark app)
    v-toolbar-title(@click='linkToHome') Annotaion
  v-content
    nuxt
  v-divider
  v-footer.pa-4.white--text(height='auto' color="blue-grey darken-2")
    v-flex.xs4
      small &copy;2019 - EISUKE UETA
</template>

<script>
export default {
  data() {
    return {
      title: 'Annotaion'
    }
  },
  methods: {
    linkToHome() {
      this.$router.push('/')
    },
    handleLogout() {}
  }
}
</script>

<style>
.v-app-bar .v-toolbar__title {
  cursor: pointer;
}
body {
  margin: 0 auto;
}
body,
h1,
h2,
h3,
h4,
h5,
h6,
div,
a,
p,
span,
small,
input {
  font-family: 'Open Sans', sans-serif;
}
</style>
