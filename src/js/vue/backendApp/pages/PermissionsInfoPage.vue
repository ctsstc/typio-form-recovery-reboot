<template>
    <div>
        <h1>Permission Information</h1>
        <div class="card">
            <p>Typio, like all other extensions, needs access to certain features in your browser in order to function. In order to remain transparent, here is a list of all permissions Typio request and a description of its use case.</p>

            <br>

            <h3>Tabs</h3>
            <p>Typio needs to access webpages you visit in order to save the input you enter. The tabs permission gives Typio permission to do that.</p>

            <br>
            <h3>http://*/* and https://*/</h3>
            <p>These permissions specify which webpages Typio has access to. It is used in combination with the tabs permission.</p>

            <br>
            <h3>storage</h3>
            <p>Because Typio keeps your data securely on your computer (and never uploads it to the cloud), it needs the storage permission to save it.</p>

            <br>
            <h3>unlimitedStorage</h3>
            <p>The standard storage permission has a limit in how much you can store. The unlimitedStorage permission allows Typio to surpass that limit. Typio doesn't need much space, but if the save duration is long, the database might grow larger with time.</p>

            <br>
            <h3>contextMenus</h3>
            <p>Needed for Typio to add the "Open Form Recovery" item in the right-click menu.</p>

            <br>
            <h3>idle</h3>
            <p>Typio needs to do some maintenance of the database sometimes. In order to keep your browsing experience smooth and snappy, it's better to do that when the computer is idle and not in use.</p>
        </div>
    </div>
</template>

<script>
    export default {
        name: "PermissionsInfoPage"
    }
</script>