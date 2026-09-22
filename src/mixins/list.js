export default {
    data() {
        return {
            temp: null,
            search: null,
            collection: {
                list: [],
                page: 1,
                pageSize: 10,
                total: 0,
                loading: false,
                refresh: () => {
                    this.collection.page = 1;
                    this._getList();
                }
            },
        }
    },
    created() {
        this.$nextTick(() => this._getList());
    },
    methods: {
        listChange(e) {
            if (this.collection.page != e.current) {
                this.collection.page = e.current;
            }
            if (this.collection.pageSize != e.pageSize) {
                this.collection.pageSize = e.pageSize;
                this.collection.page = 1;
            }
            this._getList();
        },
        _getList() {
            throw new Error('Must be implemented in your own templete')
        }
    },
}