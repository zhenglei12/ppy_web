<template><span class="status-tag" :class="tone"><slot /></span></template>
<script>export default { props: { tone: { type: String, default: 'green' } } };</script>
