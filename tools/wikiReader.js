const fs = require('fs');

// Function to get charachter before '.'
function getPrecedingValue(match){
	return ' ' + match[match.length - 1];
}

/* ============= Wiki MarkDown Reader ============= */

module.exports = {
    read : function(path) {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                console.log(err);
                return err;
            } else {
                console.log(`Reading Content from ${path}.`);
                let content = data;
                content = content
                    .replace(/\<\!\-\- TITLE:.+?\-\-\>/,"")         // Replaces TITLE
                    .replace(/\<\!\-\- SUBTITLE:.+?\-\-\>/,"")      // Replaces SUBTITLE
                    .replace(/\<\!\-\- /g,"")                       // Replaces <!--
                    .replace(/ \-\-\>/g,"")                         // Replaces -->
                    .replace(/\. [a-z]/g,getPrecedingValue)         // Replaces shortening '.'
                    .replace(/[\n\r]/g, ' ');                       // Replaces newline
                return content.split('. ');
            }
        });
    }
};