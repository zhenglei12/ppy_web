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
        data: [Object, Array, Number, String],
    },
    computed: {
        R() {
            return this.data || {};
        },
        isEdit() {
            return !!this.data;
        },
    },
    methods: {
        close() {
            // 关闭前
            this.beforeClose && this.beforeClose();
            if (this.$refs.form) {
                this.$nextTick(() => {
                    this.$refs.form.resetFields();
                });
            }
            this.$emit("visibleChange", false);
        }
    },
}