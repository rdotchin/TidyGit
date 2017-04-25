# TidyGit


## About:
TidyGit is an automated GitHub repository beautifier.

When the user selects a repository TidyGit will 
* Clone the repo
* Create a new branch called TidyGit 
* All HTML/CSS/JS files will be beautified recursively
* The changes will be committed and pushed 
* A pull request will be created for the user
 
![tidygit](https://raw.githubusercontent.com/rdotchin/tidygit/master/TidyGit/app/tidygit/layout/images/tidygit.gif)

## Custom Beautify Options

Create a .jsbeautifyrc file containing JSON data 

Example:

```json
{
    "indent_size": 4,
    "indent_char": " ",
    "indent_with_tabs": false,
    "eol": "\n",
    "end_with_newline": false,
    "indent_level": 0,
    "preserve_newlines": true,
    "max_preserve_newlines": 10,
    "space_in_paren": false,
    "space_in_empty_paren": false,
    "jslint_happy": false,
    "space_after_anon_function": false,
    "brace_style": "collapse",
    "break_chained_methods": false,
    "keep_array_indentation": false,
    "unescape_strings": false,
    "wrap_line_length": 0,
    "e4x": false,
    "comma_first": false,
    "operator_position": "before-newline"
}
```

JS Options:

```text
CLI Options:
  -f, --file       Input file(s) (Pass '-' for stdin)
  -r, --replace    Write output in-place, replacing input
  -o, --outfile    Write output to file (default stdout)
  --config         Path to config file
  --type           [js|css|html] ["js"]
  -q, --quiet      Suppress logging to stdout
  -h, --help       Show this help
  -v, --version    Show the version

Beautifier Options:
  -s, --indent-size                 Indentation size [4]
  -c, --indent-char                 Indentation character [" "]
  -t, --indent-with-tabs            Indent with tabs, overrides -s and -c
  -e, --eol                         Character(s) to use as line terminators.
                                    [first newline in file, otherwise "\n]
  -n, --end-with-newline            End output with newline
  --editorconfig                    Use EditorConfig to set up the options
  -l, --indent-level                Initial indentation level [0]
  -p, --preserve-newlines           Preserve line-breaks (--no-preserve-newlines disables)
  -m, --max-preserve-newlines       Number of line-breaks to be preserved in one chunk [10]
  -P, --space-in-paren              Add padding spaces within paren, ie. f( a, b )
  -E, --space-in-empty-paren        Add a single space inside empty paren, ie. f( )
  -j, --jslint-happy                Enable jslint-stricter mode
  -a, --space-after-anon-function   Add a space before an anonymous function's parens, ie. function ()
  -b, --brace-style                 [collapse|expand|end-expand|none][,preserve-inline] [collapse,preserve-inline]
  -B, --break-chained-methods       Break chained method calls across subsequent lines
  -k, --keep-array-indentation      Preserve array indentation
  -x, --unescape-strings            Decode printable characters encoded in xNN notation
  -w, --wrap-line-length            Wrap lines at next opportunity after N characters [0]
  -X, --e4x                         Pass E4X xml literals through untouched
  --good-stuff                      Warm the cockles of Crockford's heart
  -C, --comma-first                 Put commas at the beginning of new line instead of end
  -O, --operator-position           Set operator position (before-newline|after-newline|preserve-newline) [before-newline]
```

HTML/CSS Options:

```text
CSS Beautifier Options:
  -s, --indent-size                  Indentation size [4]
  -c, --indent-char                  Indentation character [" "]
  -t, --indent-with-tabs             Indent with tabs, overrides -s and -c
  -e, --eol                          Character(s) to use as line terminators. (default newline - "\\n")
  -n, --end-with-newline             End output with newline
  -L, --selector-separator-newline   Add a newline between multiple selectors
  -N, --newline-between-rules        Add a newline between CSS rules

HTML Beautifier Options:
  -s, --indent-size                  Indentation size [4]
  -c, --indent-char                  Indentation character [" "]
  -t, --indent-with-tabs             Indent with tabs, overrides -s and -c
  -e, --eol                          Character(s) to use as line terminators. (default newline - "\\n")
  -n, --end-with-newline             End output with newline
  -p, --preserve-newlines            Preserve existing line-breaks (--no-preserve-newlines disables)
  -m, --max-preserve-newlines        Maximum number of line-breaks to be preserved in one chunk [10]
  -I, --indent-inner-html            Indent <head> and <body> sections. Default is false.
  -b, --brace-style                  [collapse-preserve-inline|collapse|expand|end-expand|none] ["collapse"]
  -S, --indent-scripts               [keep|separate|normal] ["normal"]
  -w, --wrap-line-length             Maximum characters per line (0 disables) [250]
  -A, --wrap-attributes              Wrap attributes to new lines [auto|force|force-aligned|force-expand-multiline] ["auto"]
  -i, --wrap-attributes-indent-size  Indent wrapped attributes to after N characters [indent-size] (ignored if wrap-attributes is "force-aligned")
  -U, --unformatted                  List of tags (defaults to inline) that should not be reformatted
  -T, --content_unformatted          List of tags (defaults to pre) that its content should not be reformatted
  -E, --extra_liners                 List of tags (defaults to [head,body,/html] that should have an extra newline before them.
  --editorconfig                     Use EditorConfig to set up the options
```



