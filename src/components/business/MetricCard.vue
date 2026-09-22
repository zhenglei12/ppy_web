<template>
  <div class="metric-card">
    <div class="metric-icon" :class="tone"><a-icon :type="icon" /></div>
    <div>
      <div class="metric-label">{{ label }}</div>
      <div class="metric-value">{{ value }}</div>
      <div class="metric-trend">
        {{ compare }}
        <b v-if="trend" :class="{ down }">{{ trend }} <a-icon :type="down ? 'arrow-down' : 'arrow-up'" /></b>
      </div>
    </div>
  </div>
</template>
<script>
export default { props: { icon: String, tone: String, label: String, value: String, compare: { type: String, default: '较上月' }, trend: String, down: Boolean } };
</script>
