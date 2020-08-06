<template>
    <div>
        <h2>Blacklist</h2>

        <p>Typio will be completely disabled on these domains. Autosave and restoration will not be available.</p>
        <p>Use * as a wildcard to block all subdomains, e.g: *.bank.com</p>
        <p>You can use Regex by wrapping the pattern in forward slashes /like this/. It will match against the hostname of the site.</p>

        <form @submit="onAdd" class="add-form">
            <input ref="domainToAdd" placeholder="Enter a domain name or a Regex to block" type="text">
            <button>Add to blacklist</button>
        </form>

        <div ref="blockList" class="block-list">
            <div v-if="!blockedDomains || blockedDomains.length === 0" class="no-blocks-message">
                Your blacklist is empty.
            </div>
            <div v-for="domain in blockedDomains" ref="blockListItem" class="block-item">
                <div>
                    {{ domain }}
                </div>
                <div>
                    <a @click="onDeleteBlockValue(domain)">Delete</a>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    import blacklist from '../../../../modules/blacklist';

    export default {
        name: "BlacklistPartial",
        data() {
            return {
                blockedDomains: null,
            }
        },
        mounted() {
            blacklist.getAll(list => {
                this.blockedDomains = list;
            })
        },
        methods: {
            onAdd(e) {
                e.preventDefault();

                let value = this.sanitizeBlockValue(this.$refs.domainToAdd.value);

                if(value !== false) {
                    this.$refs.domainToAdd.value = '';
                    blacklist.blockDomain(value, newList => {
                        this.blockedDomains = newList;

                        setTimeout(() => {
                            const blockListEl = this.$refs.blockList;
                            blockListEl.scrollTop = blockListEl.scrollHeight;

                            const items = this.$refs.blockListItem;
                            items.pop().classList.add('animate');
                        })
                    })
                }
            },
            onDeleteBlockValue(value) {
                blacklist.unblock(value, newList => {
                    this.blockedDomains = newList;
                })
            },
            sanitizeBlockValue(value) {
                if(value.length < 3) return false;

                // contains http/s and not regex
                if(value.match(/^https?:\/\//) !== null && (value.charAt(0) === '/' && value.charAt(value.length-1) === '/') === false) {
                    try {
                        value = new URL(value).hostname;
                    } catch(e) {
                        return false;
                    }
                } else {
                    value = value.toLowerCase();
                }

                return value;
            },
            blockValueIsRegex(value) {
                return value.charAt(0) === '/' && value.charAt(value.length-1) === '/';
            },
        },
    }
</script>

<style lang="scss" scoped>

    .add-form {
        display: flex;
        margin-bottom: 10px;

        input {
            flex: 1;
            margin-right: 10px;
            padding: 10px;
        }
    }

    .block-list {
        position: relative;
        border: 1px solid #d4d4d4;
        min-height: 100px;
        max-height: 250px;
        overflow: auto;

        .no-blocks-message {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #808080;
        }

        .block-item {
            display: flex;
            padding: 10px 15px;

            &.animate {
                animation: blockItemIn 1s;
            }

            @keyframes blockItemIn {
                from {
                    background: #fffda4;
                }
            }

            &:hover {
                background: #f0f0f0;
            }

            div:first-child {
                flex: 1;
            }
        }
    }

</style>