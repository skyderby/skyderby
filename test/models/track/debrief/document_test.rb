require 'test_helper'

class Track::Debrief::DocumentTest < ActionView::TestCase
  setup do
    @report = Track::Debrief.new(
      locale: 'en',
      inputs: {
        'discipline' => { 'parts' => [{ 'key' => 'flare', 'season_best' => 39.5, 'points_per_unit' => 2.532 }] },
        'pilot' => { 'name' => 'Cato', 'rank' => 6 },
        'jump' => {
          'results' => { 'flare' => { 'result' => 4.3, 'points' => 10.9 } },
          'total' => 89.2,
          'metrics' => {
            'window' => { 'checkpoints' => { '4' => { 'lost' => 78 } },
                          'series' => [[0, 0, 0, 12, 12], [1, 10, 4, 14, 42]] },
            'flare' => { 'dive_v_speed' => 91, 'efficiency' => 0.033, 'series' => [[-1, -5, 150, 60], [0, 0, 122, -1]] }
          }
        },
        'references' => [{ 'name' => 'Espen', 'rank' => 1,
                           'results' => { 'flare' => { 'result' => 34.5, 'points' => 87.3 } },
                           'metrics' => { 'window' => nil, 'flare' => { 'dive_v_speed' => 128 } } }],
        'thresholds' => [{ 'rank' => 5, 'extra_needed' => { 'flare' => 6.4 } }]
      }
    )
  end

  test 'prints measured values with units for the pilot and references' do
    html = render_content('Lost <metric key="window.checkpoints.4.lost" of="self"/>, ' \
                          'dive <metric key="flare.dive_v_speed" of="ref1"/>.')

    assert_includes html, '<span class="debrief-metric">78 m</span>'
    assert_includes html, '<span class="debrief-metric">128 km/h</span>'
  end

  test 'prints scores, competition values and thresholds' do
    html = render_content('<metric key="points.flare"/> <metric key="season_best.flare"/> ' \
                          '<needed discipline="flare" rank="5"/>')

    assert_includes html, '10.9 pts'
    assert_includes html, '39.5 m'
    assert_includes html, '6.4 m'
  end

  test 'prints segment values with their units' do
    @report.inputs['jump']['metrics']['window']['segments'] = [{ 'time' => 15.4, 'energy_change' => -2601 }]

    html = render_content('<metric key="window.segments.0.time"/> <metric key="window.segments.0.energy_change"/>')

    assert_includes html, '15.4 s'
    assert_includes html, '-2601 J/kg'
  end

  test 'prints moments of a phase in seconds' do
    @report.inputs['jump']['metrics']['window']['peak_v_speed_at'] = 4.0

    assert_includes render_content('<metric key="window.peak_v_speed_at"/>'), '4.0 s'
  end

  test 'drops a unit the model repeats after a tag' do
    html = render_content('Lost <metric key="window.checkpoints.4.lost"/> m, then <metric key="points.flare"/> points.')

    assert_includes html, '78 m</span>, then'
    assert_includes html, '10.9 pts</span>.'
  end

  test 'shows a dash for values it cannot resolve' do
    html = render_content('<metric key="flare.gain" of="ref7"/> <metric key="unknown.key"/>')

    assert_equal 2, html.scan('debrief-metric--missing').size
  end

  test 'escapes raw html written by the model' do
    html = render_content('Hi <script>alert(1)</script> <b>bold</b>')

    assert_not_includes html, '<script>'
    assert_not_includes html, '<b>'
  end

  test 'renders a chart block with the pilot and references that have data' do
    html = render_content("Intro\n\n<chart name=\"flare_dive\"/>\n\nAfter")

    assert_includes html, 'data-controller="tracks--debrief-chart"'
    chart = @report.document.chart('flare_dive')
    assert_equal ['Cato'], chart['series'].pluck('name')
    assert_equal [[-1, 60], [0, -1]], chart['series'].first['rows']
  end

  test 'renders a replay told through moments with values in pilot colours' do
    html = render_content(<<~CONTENT)
      Intro

      <replay phase="flare" with="ref1">
      <moment at="-1" label="dive">You hold <v of="self">150 km/h</v> & more <b>x</b></moment>
      <moment at="end" label="top">Top at <metric key="flare.dive_v_speed"/></moment>
      </replay>

      After
    CONTENT

    assert_includes html, 'data-controller="tracks--debrief-replay"'
    assert_includes html, '<b class="debrief-replay__value debrief-tone--0">150 km/h</b>'
    assert_includes html, '&amp; more &lt;b&gt;x&lt;/b&gt;'
    assert_includes html, 'Top at 91 km/h'
    assert_includes html, '<p>After</p>'
  end

  test 'lays a flare replay out from the climb start and resolves the end moment' do
    replay = @report.document.replay('flare', [{ 't' => 'end', 'label' => 'top', 'html' => '' }], with: 'ref1')

    assert_equal ['Cato'], replay['series'].pluck('name')
    assert_equal [[-1, -37.8, -5, 150, 60], [0, 0.0, 0, 122, -1]], replay['series'].first['rows']
    assert_in_delta 0.0, replay['moments'].first['t']
    assert_nil @report.document.replay('polar', [])
  end

  test 'compares speed lost before the climb and height lost in the window with another jump' do
    @report.inputs['jump']['metrics']['flare'].merge!('max_h_speed_before' => 165, 'entry_h_speed' => 122)
    @report.evidence = { 'tracks' => { '42' => { 'pilot' => 'Espen', 'metrics' => {
      'window' => { 'checkpoints' => { '4' => { 'lost' => 70 } } },
      'flare' => { 'max_h_speed_before' => 196, 'entry_h_speed' => 170 }
    } } } }

    gap = @report.document.visual_chart('window_gap', with: 'track:42')
    loss = @report.document.visual_chart('speed_loss', with: 'track:42')
    html = render_content(%(<chart name="speed_loss" with="track:42"/>\n\n<chart name="window_gap" with="track:42"/>))

    assert_equal [{ 'second' => '4', 'gap' => 8 }], gap['gaps']
    assert_equal [100, 200], loss['range']
    assert_includes html, '−43'
    assert_includes html, 'href="/tracks/42"'
    assert_includes html, '+8 m'
  end

  test 'links jumps the model names in prose' do
    @report.evidence = { 'tracks' => { '42' => { 'pilot' => 'Cato', 'place' => 'Nosa', 'date' => '2026-10-12' } } }

    html = render_content('Same on track:42 and track:7.')

    assert_includes html, '<a href="/tracks/42" rel="nofollow">Nosa, 2026-10-12</a>'
    assert_includes html, '<a href="/tracks/7" rel="nofollow">#7</a>'

    linked = render_content('Look at [Espen](track:42).')

    assert_includes linked, '<a href="/tracks/42" rel="nofollow">Espen</a>'
  end

  test 'shows the flare height each dive speed could give next to the height climbed' do
    @report.inputs['jump']['metrics']['flare'].merge!('max_total_speed_before' => 183, 'gain' => 4.3)

    chart = @report.document.visual_chart('flare_potential')
    html = render_content('<chart name="flare_potential"/>')

    assert_in_delta 35.6, chart['columns'].first['possible']
    assert_in_delta 21.3, chart['columns'].first['typical']
    assert_equal 40, chart['scale']
    assert_includes html, '36 m possible'
    assert_includes html, 'typical: 21 m'
  end

  test 'prints term tags from older debriefs as plain words' do
    html = render_content('Your <term name="efficiency">efficiency</term> was low.')

    assert_includes html, 'Your efficiency was low.'
    assert_not_includes html, 'term'
  end

  test 'renders charts written on adjacent lines as separate blocks' do
    html = render_content(%(Text\n<chart name="flare_dive"/>\n<chart name="flare_speed"/>))

    assert_equal 2, html.scan('data-controller="tracks--debrief-chart"').size
  end

  test 'drops unknown charts' do
    html = render_content("<chart name=\"polar\"/>\n\nText")

    assert_not_includes html, 'debrief-chart'
    assert_includes html, 'Text'
  end

  private

  def render_content(content)
    @report.content = content
    @report.document.render(view)
  end
end
