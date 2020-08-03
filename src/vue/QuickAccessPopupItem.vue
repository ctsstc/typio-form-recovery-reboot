<template>
    <li v-if="itemType !== 'entry' || (itemType === 'entry' && entry.isTextType())">

        <div @click="commit()" @mouseenter="select" @mouseleave="unselect" v-bind:class="[selected ? 'selected' : '', 'selectable', 'fill']" :data-tooltip="itemTooltip">

            <template v-if="itemType === 'entry'">
                <span v-if="!isSess" class="icon inner-fake-arrow icon-arrow-forward"><span data-tooltip="Restore this entry (this entry was typed in another field)"></span></span>
                <span v-html="entry.getPrintableValue({truncate: 80})"></span>
            </template>

            <template v-if="itemType === 'link' && itemText">
                {{ itemText }}
            </template>
            <template v-if="itemType === 'link' && itemImg">
                <span v-bind:class="['icon', itemImg]"></span>
            </template>

        </div>

        <div data-tooltip="Restore just this entry." v-if="isSess" @click="commit(true)" @mouseenter="singleSelect" @mouseleave="unselect" v-bind:class="[singleSelected ? 'selected' : '', 'selectable', 'flex-icon', 'keyboard-ignore']">
            {{ entry.session.length }}
            <span class="icon icon-arrow-forward"></span>
        </div>

    </li>
</template>

<script>
    import placeholders from '../js/modules/placeholders';
    import EditableDefaults from '../js/modules/EditableDefaults';
    import recoveryDialogController from '../js/controllers/content/recoveryDialogController';
    import keyboardShortcutController from '../js/controllers/content/keyboardShortcutController';
    import blockController from '../js/controllers/content/blockController';

    export default {
        name: "QuickAccessPopupItem",
        props: ['itemType', 'action', 'isSess', 'itemText', 'itemTooltip', 'itemImg',		'entry', 'editable'],
        data: function() {
            return {
                selected: false,
                singleSelected: false
            }
        },
        // Todo: 🤮
        computed: {
            rootInstance() {
                return this.$root.$children[0];
            }
        },
        methods: {
            select() {
                if(this.selected) return;
                this.rootInstance.unselect();
                this.rootInstance.select(this);
                this.selected = true;

                if(this.itemType === 'entry' && this.isSess) {
                    let sess = this.entry.getSession();

                    placeholders.snapshot(sess.getEditables());
                    sess.setPlaceholders();
                } else if(this.itemType === 'entry') {
                    placeholders.snapshot(this.editable);
                    this.editable.applyPlaceholderEntry(this.entry);
                }
            },
            singleSelect() {
                if(this.singleSelected) return;
                this.rootInstance.unselect();
                this.rootInstance.select(this);
                this.singleSelected = true;

                placeholders.snapshot(this.editable);
                this.editable.applyPlaceholderEntry( this.entry );
            },
            unselect() {
                if(this.rootInstance.currSel && this !== this.rootInstance.currSel) {
                    this.rootInstance.currSel.unselect();
                }
                if(!this.selected && !this.singleSelected) return;

                this.selected = false;
                this.singleSelected = false;

                placeholders.restore();
            },
            commit(commitSingleFromSession) {
                if(this.itemType === 'link') {
                    if(this.action === 'openRecovery') recoveryDialogController.open();
                    else if(this.action === 'openKeyboardModal') keyboardShortcutController.showShortcutDialog();
                    else if(this.action === 'disableTypio') blockController.block();
                    else return;
                }
                const lastFocused = window.terafm.focusedEditable || terafm.lastFocusedEditable;
                lastFocused.el.focus();

                placeholders.restore();
                EditableDefaults.restore();
                this.rootInstance.hide();

                if(this.entry) {
                    if(!this.isSess || commitSingleFromSession) {
                        this.editable.applyEntry(this.entry);

                    } else if(this.isSess) {
                        this.entry.getSession().restore();
                    }
                }
            },
        },
    }
</script>

<style scoped>

</style>