// 文章页目录高亮：找出当前滚动位置对应的那个标题
let tocItems = null;

function updateTocHighlight() {
    if (tocItems === null) {
        tocItems = [];
        document.querySelectorAll("#post-toc .toc-link").forEach((link) => {
            const href = link.getAttribute("href") || "";
            if (href.charAt(0) !== "#") return;
            let id = href.slice(1);
            try {
                id = decodeURIComponent(id);
            } catch (e) {
                // 解码失败就按原样找
            }
            const el = document.getElementById(id);
            if (el) tocItems.push({ link, el });
        });
    }
    let active = null;
    for (const item of tocItems) {
        if (item.el.getBoundingClientRect().top <= 100) active = item;
        else break;
    }
    for (const item of tocItems) {
        item.link.classList.toggle("active", item === active);
    }
}

const app = Vue.createApp({
    mixins: Object.values(mixins),
    data() {
        return {
            loading: true,
            hiddenMenu: false,
            showMenuItems: false,
            menuColor: false,
            scrollTop: 0,
            renderers: [],
        };
    },
    created() {
        window.addEventListener("load", () => {
            this.loading = false;
        });
    },
    mounted() {
        window.addEventListener("scroll", this.handleScroll, true);
        this.render();
        this.handleScroll();
    },
    methods: {
        render() {
            for (let i of this.renderers) i();
        },
        handleScroll() {
            let wrap = this.$refs.homePostsWrap;
            let newScrollTop = document.documentElement.scrollTop;
            if (this.scrollTop < newScrollTop) {
                this.hiddenMenu = true;
                this.showMenuItems = false;
            } else this.hiddenMenu = false;
            if (wrap) {
                if (newScrollTop <= window.innerHeight - 100) this.menuColor = true;
                else this.menuColor = false;
                if (newScrollTop <= 400) wrap.style.top = "-" + newScrollTop / 5 + "px";
                else wrap.style.top = "-80px";
            } else {
                // 文章页：顶部大图还没滚过去时，让菜单变成半透明压在图上
                const head = document.getElementById("post-head");
                if (head) this.menuColor = newScrollTop <= head.offsetHeight - 60;
            }
            updateTocHighlight();
            this.scrollTop = newScrollTop;
        },
    },
});
app.mount("#layout");
