Skyderby.helpers.RangeSelector = ($el, min, max, from, to) ->

    $el.ionRangeSlider({
        min: min,
        max: max,
        type: 'double',
        step: 50,
        prettify: false,
        hasGrid: true,
        from: from,
        to: to,
        onFinish: (obj) ->
          $.rails.handleRemote(obj.input)
            # if (Track.in_imperial) {
            #     Track.range_from = obj.fromNumber / mft_k;
            #     Track.range_to = obj.toNumber / mft_k;
            # } else {
            #     Track.range_from = obj.fromNumber;
            #     Track.range_to = obj.toNumber;
            # }
            # window.history.replaceState({}, document.title, "?f=" + Track.range_from + "&t=" + Track.range_to);
    })

