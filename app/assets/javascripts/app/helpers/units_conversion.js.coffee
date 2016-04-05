Skyderby.helpers.unit_conversion =

  ft_in_m: 3.280839895
  knots_in_ms: 1.9438444924574
  kmh_in_ms: 3.6
  mph_in_ms: 2.236936

  m_to_ft: (val) ->
    val * @ft_in_m

  ft_to_m: (val) ->
    val / @ft_in_m

  ms_to_knots: (val) ->
    val * @knots_in_ms

  knots_to_ms: (val) ->
    val / @knots_in_ms

  ms_to_kmh: (val) ->
    val * @kmh_in_ms

  kmh_to_ms: (val) ->
    val / @kmh_in_ms

  ms_to_mph: (val) ->
    val * @mph_in_ms

  mph_to_ms: (val) ->
    val / @mph_in_ms
