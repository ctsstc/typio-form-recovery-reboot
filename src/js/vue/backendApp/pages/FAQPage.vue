<template>
    <div>
        <h1>Frequently Asked Questions</h1>

        <div id="save-frequency" class="card">
            <h2>How frequently does Typio save my input?</h2>
            <p>Typio does not save your data in a fixed interval, but rather saves it as you are typing with a one second throttle (meaning it will trigger a save maximum once every second, regardless of your typing speed). It also saves before navigating away from every page.</p>
            <p>If your form input is lost it is likely due to something else.</p>
        </div>

        <div id="input-not-saved" class="card">
            <h2>Why wasn't input wasn't saved?</h2>
            <p>Typio does its best to save all of your form data, and in most cases it does a great job. There are however a few edge cases Typio is unable to deal with due to browser restrictions.</p><br>

            <h3>Cross domain iframes</h3>
            <p>Sometimes websites embed content from other sources. This is common with certain comment/contact solutions (Disqus, for example). Due to browser restrictions Typio cannot access anything from within the embedded frame. If the source of the frame is on the same domain, Typio has no problems accessing and saving your data. Form elements within Shadow DOM are also supported.</p><br>

            <h3>Sub domains</h3>
            <p>Typio separates the data for each domain into individual storage buckets. That means that if you type something on foo.example.com you will not be able to view the data on bar.example.com. If you cannot find your data, make sure to double check you are on the same domain as where you typed it. This is easy to miss on sites like tumblr.com where each profile has its own subdomain, or craigslist, where each advertisement gets its own subdomain.</p><br>

            <h3>Still lost?</h3>
            <p>If you still can't find the data, try to reproduce the steps and <a href="feedback.html">file a bug report</a>.</p>
        </div>

        <div id="error-input-not-found" class="card">
            <h2>Error: Cannot find a focused input field</h2>
            <p>You might encounter this error when attempting to open Quick Access with the icon or with the keyboard shortcut. This problem occurs when the input field is of a custom type (contenteditable) and the website manipulates the field. Typio is still active and working, but the Quick Access popup cannot show. You can access your data through the recovery dialog (right click anywhere &gt; Open form recovery).</p>
        </div>

        <div id="error-cannot-auto-restore" class="card">
            <h2>Error: Entry cannot be restored automatically</h2>
            <p>The field the entry was typed in cannot be found on the current page. Either the field does not exist, or it cannot be found in the same place (path has changed). You can manually restore the entry by copying it.</p>
        </div>

    </div>
</template>

<script>
    export default {
        name: "FAQPage"
    }
</script>