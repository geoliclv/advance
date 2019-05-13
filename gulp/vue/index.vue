<template>
  <div>
    <div>this is a vue text</div>
    <div class="title">{{title}}</div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      title: "compiered by gulp"
    };
  }
};
</script>
<style lang="scss" scoped>
$color: red;
.title {
  color: $color;
}
</style>
