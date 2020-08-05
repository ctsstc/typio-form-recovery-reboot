<template>
    <div>
        <h2>Blacklist</h2>

        <p>Typio will be completely disabled on these domains, autosave and restoration will not be available.</p>
        <p>Use * as a wildcard to block all subdomains, e.g: *.bank.com</p>
        <p>You can use Regex by wrapping the pattern in forward slashes /like this/. It will match against the hostname of the site.</p>

        <form>
            <input type="text">
            <button>Add to blacklist</button>
        </form>

        <div style="border: 1px solid rgba(0,0,0,.3); padding: 10px;">list...</div>

    </div>
</template>

<script>
    export default {
        name: "BlacklistPartial"
    }
</script>