<template>
    <div id="quickAccess" v-bind:class="[!isVisible ? 'hidden' : '']">

        <p v-if="isEmpty" style="margin: 10px; font-weight: bold;">No entries found.</p>

        <ul class="entry-list" v-for="(dataType, index) in Object.keys(data)" :key="index">
            <entry-item v-for="(entry, i) in data[dataType].entries" :key="i" item-type="entry" :entry="entry" :editable="editable" :isSess="dataType === 'sess'"></entry-item>
        </ul>

        <ul class="footer">
            <entry-item item-type="link" action="openRecovery" item-text="Browse all entries"></entry-item>
            <entry-item item-size="short" item-tooltip="Show keyboard shortcuts" item-type="link" action="openKeyboardModal" item-img="icon-keyboard"></entry-item>
            <entry-item item-size="short" item-tooltip="Disable Typio on this domain" item-type="link" action="disableTypio"  item-img="icon-block"></entry-item>
        </ul>
    </div>
</template>

<script>
    import Options from '../js/modules/options/options';
    import Editables from '../js/modules/Editables';
    import db from '../js/modules/db/db';
    import placeholders from '../js/modules/placeholders';

    import QuickAccessPopupItem from './QuickAccessPopupItem.vue';

    export default {
        name: "QuickAccessPopup",
        components: {
            'entry-item': QuickAccessPopupItem,
        },
        data() {
            return {
                isVisible: true,
                isEmpty: true,
                data: {},
                editable: false,
                currSel: false,
            }
        },
        methods: {
            showAndPopulate: function(ed, coord) {
                if(!ed) throw new Error('No editable');

                let maxItems = 10;
                let data = { sess: [], recent: [] };

                if(Options.get('qaGroupSessions')) {
                    data.sess = db.getSessionsContainingEditable(window.terafm.focusedEditable.id, maxItems).getEntriesByEditable(window.terafm.focusedEditable.id, maxItems);
                }
                data.recent = db.getEntries(maxItems-data.sess.length, window.terafm.focusedEditable.id, function(entry) {
                    return Editables.isTextEditableType(entry.type);
                });

                this.data = data;
                this.isEmpty = (data.sess.length || data.recent.length) ? false : true;
                this.editable = ed;
                this.isVisible = true;

                requestAnimationFrame(() => {
                    this.position(ed, coord);
                });
            },
            unselect: function() {
                if(!this.currSel) return;
                this.currSel.selected = false;
                this.currSel.singleSelected = false;
                this.currSel = false;
                placeholders.restore();
            },
            select: function(obj) {
                this.currSel = obj;
            },
            position: function(ed, coord) {
                let popupHeight = this.$el.clientHeight,
                    popupWidth = this.$el.clientWidth;

                let pos = {x:0, y:0};
                let edrect = ed.rect();

                // Position by editable
                if(ed && !coord) {
                    pos.x = edrect.x + edrect.width;
                    pos.y = edrect.y + 6;

                    // Position by click coord
                } else {
                    pos = coord;
                }

                // If width overflows, position by editable instead
                if(pos.x + popupWidth > docWidth() && edrect.x - popupWidth > 0) {
                    pos.x = edrect.x - popupWidth;
                }

                // If overflows height
                if(pos.y + popupHeight > docHeight()) {
                    pos.y -= popupHeight;
                }

                this.$el.style = 'top: '+ pos.y +'px; left: '+ pos.x +'px;';

                function docHeight() {
                    return document.documentElement.scrollHeight; //return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight/*, document.documentElement.clientHeight*/);
                }
                function docWidth() {
                    return document.documentElement.scrollWidth;
                }
            },
            hide: function() {
                this.unselect();
                this.isVisible = false;
            },
            abort() {
                this.hide();
                placeholders.restore();
            }
        },
    }
</script>