export default function(src, opts = {}) {
    var script = document.createElement("script")
    script.type = "text/javascript"

    if (opts['on_error']) script.onerror = opts.on_error
    if (opts['on_load']) script.onload = opts.on_load

    document.getElementsByTagName("head")[0].appendChild(script)
    script.src = src
}
