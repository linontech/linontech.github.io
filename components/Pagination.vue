<template>
    <div class="mt-3">

        <vnode-to-html :vnode="$slots.default" @html="html4ArticleTitles = $event"/>

        <div v-html="item" v-for="(item,index) in articleTitlesTemp" :key="index">
            {{ item }}
        </div>

        <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
        ></b-pagination>

        <ul class="pagination">
            <li class="page-item active"><a class="page-link">Total {{ totalRows }}</a></li>
        </ul>

    </div>
</template>

<script>
    import { onTagSelect } from '../js/archive';
    export default {
        name: 'Pagination',
        data: function() {
            return {
                totalPage: -1,
                perPage: 5,
                currentPage: 1,
                html4ArticleTitles: '',
                articleTitles: [],
                delimiter: '<h5></h5>',
                observer: null
            }
        },
        created() {
            console.log(this.itemType)
        },
        beforeDestroy: function() {
            this.observer.disconnect();
        },
        computed: {
            articleTitlesTemp () {
                return this.articleTitles.slice(this.perPage*(this.currentPage-1), this.perPage*(this.currentPage));
            },
            totalRows () {
                return this.articleTitles.length;
            }
        },
        watch: {
        },
        mounted() {
            /* WHY USE IN MOUNT HERE ? */
            this.parseArticleTitlesHtml(this.html4ArticleTitles);

            /* MutationObserver */
            this.observer = new MutationObserver(function(mutations) {
                this.parseArticleTitlesHtml(document.getElementById('htmlToVue').outerHTML);
            }.bind(this));

            this.observer.observe(
                document.getElementById('htmlToVue'),
                { attributes: true, childList: true, characterData: true, subtree: true }
            );
        },
        updated: function () {
            this.$nextTick(function () {
                /**
                 * Code that will run only after the entire view has been re-rendered
                 */
                (this.itemType === 'tag') && onTagSelect(false, 'tags');
                (this.itemType === 'category') && onTagSelect(false, 'categories');
            })
        },
        props: {
            itemType: String
        },
        methods: {
            parseArticleTitlesHtml: function(html4Titles) {
                /**
                 * split the rendered html using 'delimiter'
                 */
                let pos = html4Titles.lastIndexOf("</div>");
                let temp = html4Titles.slice(0, pos) + html4Titles.slice(pos).replace("</div>", "");
                temp = temp.split("<section>").join("").split("</section>").join(""); // delete <section>

                /**
                 * eliminate htmlToVue id, which should only be found in template during replacing html content in slot.
                 */
                this.articleTitles = temp.replace("<div id=\"htmlToVue\">","")
                    .split(this.delimiter).slice(0, -1);

                /**
                 * filter of articles for tag selection
                 */
                this.articleTitles = this.articleTitles.filter(function(part) {
                    return part.indexOf("d-none") === -1;
                });
            },
            handler4TagClick: function() {
            }
        }
    }
</script>
