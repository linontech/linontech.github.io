<template>
    <!--
    如何督促多读读，多写写。
    -->
    <!--
    this is a tag color loader for hierarchical levels.
    -->

    <!-- load tag levels in jekyll data folder,
        '知乎,4' indicates 4th tag
        根据各级标签的个数决定，标签的颜色深浅，<10/>=20/>=30
    -->

    <!--
    determine tag color ids
    -->

</template>

<script>
    export default {
        name: 'TagColorLoader',
        props: {
           num: Number
        },
        data: function() {
            return {
            };
        },
        method: {
            tagColorIdFor: function(level, num) {
                let amountIndicator = '';
                if (num < 10) {
                   amountIndicator = 'little';
                } else if (num >= 20) {
                    amountIndicator = 'medium'
                } else if (num >= 30) {
                    amountIndicator = 'lots'
                }
                return '#tag-' + level + '-' + amountIndicator;
            }
        }
    }
</script>

<style lang="scss" scoped>
    #tag-1-little {
        color: lightgreen;
    }
    #tag-1-medium {
        color: forestgreen;
    }
    #tag-1-lots {
        color: darkseagreen;
    }
    #tag-2-little {
        color: lightskyblue;
    }
    #tag-2-medium {
        color: deepskyblue;
    }
    #tag-2-lots {
        color: cornflowerblue;
    }
    #tag-3-little {
        color: seashell;
    }
    #tag-3-medium {
        color: lavenderblush;
    }
    #tag-3-lots {
        color: blanchedalmond;
    }
    #tag-4-little {
        color: lightgray;
    }
    #tag-4-medium {
        color: darkgray;
    }
    #tag-4-lots {
        color: lightslategray;
    }
    #tag-0-0 {
        color: firebrick;
    }
</style>
