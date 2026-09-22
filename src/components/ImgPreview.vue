<template>
  <a-modal :visible="visible" :footer="null" @cancel="close">
    <img alt="example" style="width: 100%" :src="urls" />
  </a-modal>
</template>

<script>
export default {
  model: {
    prop: "visible",
    event: "visibleChange",
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    urls: [Object, Array, Number, String],
  },
  methods: {
    close() {
      this.$emit("visibleChange", false);
    },
  },
};
</script>