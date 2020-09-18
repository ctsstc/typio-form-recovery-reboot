<template>
    <a class="popup-wrapper" target="_blank" href="https://www.buymeacoffee.com/typio">
        <img width="20px" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIyNCIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgLTEwMjguNCkiPjxwYXRoIGQ9Im03IDEwMzEuNGMtMS41MzU1IDAtMy4wNzg0IDAuNS00LjI1IDEuNy0yLjM0MzEgMi40LTIuMjc4OCA2LjEgMCA4LjVsOS4yNSA5LjggOS4yNS05LjhjMi4yNzktMi40IDIuMzQzLTYuMSAwLTguNS0yLjM0My0yLjMtNi4xNTctMi4zLTguNSAwbC0wLjc1IDAuOC0wLjc1LTAuOGMtMS4xNzItMS4yLTIuNzE0NS0xLjctNC4yNS0xLjd6IiBmaWxsPSIjYzAzOTJiIi8+PC9nPjwvc3ZnPg==" alt="Heart" />
        <div class="popup">
            <p><b>Show some love!</b></p>
            <p>Support the development of Typio by buying me a coffee. ☕️</p>
            <p><span class="button">Buy me a coffee!</span></p>
        </div>
    </a>
</template>

<script>
    export default {
        name: "DonateHint"
    }
</script>

<style lang="scss" scoped>

    .popup-wrapper {
        position: absolute;
        top: 30px;
        right: 30px;
        width: 150px;
        text-align: right;
        padding-bottom: 20px;
        display: inline-block;
        transition-duration: .2s;

        img {
            animation: pulse 2s ease-in-out alternate infinite;

            @keyframes pulse {
                from {
                    opacity: .4;
                    transform: scale(.8);
                }
            }
        }

        &:hover {
            img {
                opacity: 1;
                animation: none;
            }

            .popup {
                display: block;
            }
        }

    }

    .popup {
        position: absolute;
        top: 100%;
        right: -12px;
        width: 340px;
        padding: 20px;
        border-radius: 5px;
        background: #FFF;
        //box-shadow: 0 2px 5px rgb(0 0 0 / 5%), 0 5px 35px rgb(0 0 0 / 15%);
        border: 1px solid #dadada;
        color: #444;
        text-align: left;
        display: none;
        animation: popupIn .3s;
        transform-origin: right top;

        p:first-child {
            margin-top: 0;
        }
        p:last-child {
            margin-bottom: 0;
        }

        @keyframes popupIn {
            from {
                transform: scale(.9);
                opacity: 0;
            }
        }

        &::before {
            bottom: calc(100% - 1px);
            right: 10px;
            content: '';
            position: absolute;
            border: 10px solid #FFF;
            filter: drop-shadow(0 -2px 0 #dadada);
            border-top: none;
            border-left-color: transparent;
            border-right-color: transparent;
        }

        .button {
            padding: 4px 8px;
            display: inline-block;
            background: #ef6c6c;
            color: #FFF;
            border-radius: 3px;
            position: relative;
            z-index: 1;

            &:hover {
                background: #f25757;

                &::after {
                    transform: scale(1.05);
                    transition-duration: .1s;
                }
            }

            &::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: inherit;
                border-radius: inherit;
                transition-duration: .3s;
                z-index: -1;
            }
        }
    }

</style>