<template>
  <a-form-model layout="inline" :model="form">
    <a-form-model-item
      v-for="(item, index) in visibleCondition"
      :key="index"
      :label="item.label"
    >
      <a-date-picker
        v-if="item.type === 'date'"
        v-model="form[item.key]"
        :placeholder="item.placeholder || item.label || '请选择日期'"
        :valueFormat="item.showTime ? 'YYYY-MM-DD hh:mm:ss' : 'YYYY-MM-DD'"
        @change="delaySubmit"
      />
      <a-select
        class="searchheader-select"
        v-else-if="item.type === 'select'"
        v-model="form[item.key]"
        :placeholder="item.placeholder || item.label || '请选择'"
        @change="delaySubmit"
        allowClear
        :showSearch="item.showSearch || false"
        optionFilterProp="children"
      >
        <a-select-option
          v-for="(o, i) in item.options"
          :key="'select-' + index + '-' + i"
          :value="o[item.valueKey || 'value']"
        >
          {{ o[item.labelKey || "label"] }}
        </a-select-option>
      </a-select>
      <a-range-picker
        v-else-if="item.type === 'date-in'"
        v-model="form[item.key]"
        :placeholder="[
          (item.placeholder && item.placeholder[0]) || item.label || '开始日期',
          (item.placeholder && item.placeholder[1]) || item.label || '结束日期',
        ]"
        :valueFormat="item.showTime ? 'YYYY-MM-DD hh:mm:ss' : 'YYYY-MM-DD'"
        @change="delaySubmit"
      />
      <a-cascader
        v-else-if="item.type === 'cascader'"
        v-model="form[item.key]"
        :options="item.options"
        :placeholder="item.placeholder || item.label || '请选择'"
        :change-on-select="item.changeOnSelect"
        :fieldNames="{
          label: item.labelKey || 'label',
          value: item.valueKey || 'value',
          children: item.childrenKey || 'children',
        }"
        @change="delaySubmit"
      />
      <a-input-group v-else-if="item.type === 'amount-range'" compact>
        <a-input-number
          v-model="form[item.key]"
          :min="0"
          :precision="2"
          :placeholder="(item.placeholder && item.placeholder[0]) || '最低金额'"
          @change="delaySubmit"
        />
        <span class="amount-separator">至</span>
        <a-input-number
          v-model="form[item.endKey]"
          :min="0"
          :precision="2"
          :placeholder="(item.placeholder && item.placeholder[1]) || '最高金额'"
          @change="delaySubmit"
        />
      </a-input-group>
      <a-input
        v-else
        v-model="form[item.key]"
        allowClear
        :placeholder="item.placeholder || item.label"
        @change="delaySubmit"
      />
    </a-form-model-item>
    <a-form-model-item v-if="hasOptionalCondition">
      <a-dropdown
        :trigger="['click']"
        :visible="conditionMenuVisible"
        @visibleChange="conditionMenuVisibleChange"
      >
        <a-button>搜索条件 <a-icon type="down" /></a-button>
        <div slot="overlay" class="condition-menu" @click.stop>
          <div class="condition-options">
            <a-checkbox
              v-for="item in optionalCondition"
              :key="item.key"
              :checked="pendingSelectedKeys.indexOf(item.key) !== -1"
              @change="toggleCondition(item.key, $event.target.checked)"
            >
              {{ item.label || item.placeholder || item.key }}
            </a-checkbox>
          </div>
          <div class="condition-footer">
            <a-button type="primary" size="small" block @click="confirmCondition">确认</a-button>
          </div>
        </div>
      </a-dropdown>
    </a-form-model-item>
    <a-form-model-item>
      <a-button type="primary" @click="submit">搜索</a-button>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
export default {
  model: {
    prop: "input",
    event: "change",
  },
  props: {
    input: Object,
    condition: {
      type: Array,
      required: true,
    },
    collection: Object,
    defaultVisibleKeys: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: this.input || {},
      selectedKeys: [],
      pendingSelectedKeys: [],
      conditionMenuVisible: false,
    };
  },
  computed: {
    optionalCondition() {
      return this.condition.filter((item) => this.defaultVisibleKeys.indexOf(item.key) === -1);
    },
    hasOptionalCondition() {
      return this.defaultVisibleKeys.length > 0 && this.optionalCondition.length > 0;
    },
    visibleCondition() {
      if (!this.defaultVisibleKeys.length) return this.condition;
      return this.condition.filter(
        (item) => this.defaultVisibleKeys.indexOf(item.key) !== -1 || this.selectedKeys.indexOf(item.key) !== -1
      );
    },
  },
  watch: {
    form: {
      deep: true,
      handler() {
        for (const key in this.form) {
          if (Object.hasOwnProperty.call(this.form, key)) {
            if (this.form[key] == null || this.form[key] == "") {
              delete this.form[key];
            }
            const element = this.condition.find((_) => _.key === key);
            if (!element) {
              return;
            }
          }
        }
      },
    },
  },
  methods: {
    conditionMenuVisibleChange(visible) {
      this.conditionMenuVisible = visible;
      if (visible) {
        this.pendingSelectedKeys = [...this.selectedKeys];
      }
    },
    toggleCondition(key, checked) {
      if (checked) {
        if (this.pendingSelectedKeys.indexOf(key) === -1) {
          this.pendingSelectedKeys = [...this.pendingSelectedKeys, key];
        }
        return;
      }
      this.pendingSelectedKeys = this.pendingSelectedKeys.filter((itemKey) => itemKey !== key);
    },
    confirmCondition() {
      const removedKeys = this.selectedKeys.filter((key) => this.pendingSelectedKeys.indexOf(key) === -1);
      removedKeys.forEach((key) => {
        const item = this.condition.find((condition) => condition.key === key);
        this.$delete(this.form, key);
        if (item && item.endKey) this.$delete(this.form, item.endKey);
      });
      this.selectedKeys = [...this.pendingSelectedKeys];
      this.conditionMenuVisible = false;
      this.submit();
    },
    delaySubmit() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => this.submit(), 500);
    },
    submit() {
      this.$emit("change", this.form);
      if (this.collection) {
        this.collection.refresh();
      }
    },
  },
};
</script>

<style lang="less" scoped>
.searchheader {
  &-select {
    min-width: 120px;
  }
}
.condition-menu {
  min-width: 150px;
  padding: 10px 14px 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.condition-options {
  max-height: 280px;
  overflow-y: auto;

  .ant-checkbox-wrapper {
    display: block;
    margin: 4px 0;
  }
}
.condition-footer {
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
}
.amount-separator {
  display: inline-block;
  width: 32px;
  line-height: 32px;
  text-align: center;
  background: #fafafa;
  border-top: 1px solid #d9d9d9;
  border-bottom: 1px solid #d9d9d9;
}
</style>
