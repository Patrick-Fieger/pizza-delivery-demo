<template>
  <div class="text-center hero">
    <img class="mb-3 app-logo" src="https://cdn-icons-png.flaticon.com/512/599/599995.png" alt="Vue.js logo" width="120" />
    <h1 class="mb-4">Pizza Delivery Demo</h1>
    <p class="lead">
      You want some original italian style pizza?

      <br>
      <router-link to="/order" class="link">Click here!</router-link>
      
    </p>
  </div>
</template>

<script>
export default {
  name: "Hero"
};
</script>
