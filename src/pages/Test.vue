<template>
  <div>
    <a-cascader
      v-model="value"
      :options="options"
      :load-data="loadData"
      :popupVisible="popupVisible"
      placeholder="Please select"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      value: null,
      popupVisible: false,
      options: [
        {
          value: "zhejiang",
          label: "Zhejiang",
          isLeaf: false,
        },
        {
          value: "jiangsu",
          label: "Jiangsu",
          isLeaf: false,
        },
      ],
    };
  },
  methods: {
    loadData(selectedOptions) {
      console.log(this.value);
      const targetOption = selectedOptions[selectedOptions.length - 1];
      targetOption.loading = true;
      setTimeout(() => {
        targetOption.loading = false;
        if (selectedOptions.length == 2) {
          targetOption.isLeaf = true;
          this.value = selectedOptions.map((_) => _.value);
          return;
        }
        targetOption.children = [
          {
            label: `${targetOption.label} Dynamic 1`,
            value: "dynamic1",
            isLeaf: false,
          },
          {
            label: `${targetOption.label} Dynamic 2`,
            value: "dynamic2",
            isLeaf: false,
          },
        ];
        this.options = [...this.options];
      }, 1000);
    },
  },
};
</script>
