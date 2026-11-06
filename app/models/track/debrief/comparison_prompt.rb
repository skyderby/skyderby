class Track::Debrief::ComparisonPrompt
  include Track::Debrief::PromptParts

  SERIES_STEPS = { 'window' => 1.0, 'flare' => 0.5 }.freeze
  TASKS = {
    'time' => 'The pilot asks about time: how long each jump takes to fall through the window. It is won by the ' \
              'lowest vertical speed held through the whole window; horizontal speed matters only as far as it ' \
              'keeps the wing flying, and a slow window starts in the run-up.',
    'distance' => 'The pilot asks about distance: the straight-line horizontal distance across the window. It is ' \
                  'won by the best glide at an efficient speed, held through the whole window on a straight line.',
    'speed' => 'The pilot asks about speed: the average horizontal speed across the window. It is won by entering ' \
               'the window already fast, after a dive above it, and holding a fast, straight line to the end.'
  }.freeze
  OPENING = 'You are a wingsuit coach on Skyderby, a GPS track analysis site.'.freeze

  INTROS = {
    'window' => <<~TEXT,
      The pilot compares two jumps in Skyderby's Pro View, their own jump and a second one, in the same altitude
      window, and asks what the difference is and what it means for their flying. The window here is not a ranking
      window: it is the range the pilot chose on screen, from FROM to TO m, and the run-up from exit to it. Read the
      jumps the way Pro View shows them: the run-up, the entry, the segments of the window and how speeds change, so
      the pilot can find the same thing on screen.
    TEXT
    'flare' => <<~TEXT
      The pilot compares the flares of two jumps, their own and a second one: the highest climb of each jump and the
      dive before it. They ask what the difference is and what it means for their flying. Look at the dive, the speed
      at its top, the level-off, the start of the climb and how much of the energy became height.
    TEXT
  }.freeze

  GOOD = <<~TEXT.freeze
    What a good comparison does:
    - It opens with the one difference that matters most, in a sentence or two.
    - It explains the three to five differences that matter most, the biggest first, and shows each one with a replay
      of both jumps that stops at the moments where the difference appears.
    - It stays within what GPS can show: speeds, heights and timing, not the body. Offer causes in body position or
      technique only as a possibility ("this often comes from ..."), never as a fact.
    - It ends with one or two things to try on the next jump, each a measurable target in speeds and timing.
    - It is on the pilot's side and does not pass verdicts. When the second jump is worse at something, say what the
      pilot's jump does better. When the two jumps differ in suit, place or day, say what that limits.
    - It is short and plain, written to the pilot in the second person, under 400 words.
  TEXT

  WORDS_TEXT = <<~TEXT.freeze
    Words that matter to pilots: say "head", not "nose"; never "pull" or "pull-out" for flight, because pull means
    deploying the parachute: say "level out" or "round out".
  TEXT

  REPLAYS = {
    'window' => 'phase "window": height lost against distance, at is seconds from the window start, negative in the ' \
                'run-up, or "end".',
    'flare' => 'phase "flare": the last 3 s of the dive and the climb, aligned at the climb start, at is seconds ' \
               'from the climb start, negative before it (from -3), or "end" for the top.'
  }.freeze

  CHARTS = {
    'window' => '<chart name="window_gap" with="track:OTHER"/> (how much lower the pilot is than the second jump at ' \
                'the checkpoints) and <chart name="window_speed" with="track:OTHER"/> (horizontal speed over time).',
    'flare' => '<chart name="flare_potential" with="track:OTHER"/> (the height each top total speed could give at ' \
               'the level of the best flares, and the height climbed), <chart name="speed_loss" ' \
               'with="track:OTHER"/> (horizontal speed at top speed and at the start of the climb) and ' \
               '<chart name="flare_gain" with="track:OTHER"/> (height gained over time).'
  }.freeze

  SERIES = {
    'window' => 'Window series, one row per second: [seconds from the window start, metres lost, metres from the ' \
                'window start, horizontal km/h, vertical km/h]. Negative seconds are the run-up.',
    'flare' => 'Flare series, one row per half second: [seconds from the climb start, metres above the climb ' \
               'start, horizontal km/h, vertical km/h]. Negative seconds are the dive; negative vertical speed is ' \
               'climbing.'
  }.freeze

  FORMAT_TEXT = <<~TEXT.freeze
    Format: Markdown with the tags below, no tables, no other HTML, no title at the top. Measured values are printed
    with tags, never typed as digits; values read off the series are plain text, rounded ("about 120 km/h").
    - <metric key="KEY" of="WHO"/> prints a measured value with its unit. WHO is "self" (the pilot's jump) or
      "track:OTHER" (the second jump). KEY is METRIC_KEYS.
    - A replay, on its own lines:
        <replay phase="PHASE" with="track:OTHER">
        <moment at="SECONDS" label="LABEL">One or two sentences about this moment.</moment>
        </replay>
      An animated side view of both jumps that stops at each moment. REPLAY Use three to five moments in time order
      with short labels. Inside moment text wrap each jump's numbers in <v of="WHO">...</v>, for example: you sink at
      <v of="self">45 km/h</v>, the second jump at <v of="track:OTHER">38</v>. No other tags or markdown inside.
    - Charts, each on its own line: CHARTS
  TEXT

  def initialize(debrief)
    @debrief = debrief
  end

  def system
    [OPENING, KINDS.fetch(kind), substitute(INTROS.fetch(phase)), GOOD, focus_notes, MOVING_AIR, WORDS_TEXT,
     format_text, (READER unless debrief.read_by_pilot?)].compact.join("\n")
  end

  def user_message
    <<~MESSAGE
      Write in English.

      The pilot's jump (self) and the second jump (track:#{other_id}):
      #{JSON.pretty_generate(summary)}

      #{SERIES.fetch(phase)}
      #{JSON.generate(series)}
    MESSAGE
  end

  private

  attr_reader :debrief

  def comparison = debrief.inputs['comparison'].to_h

  def focus = Track::Debrief::Comparison.focus_of(comparison['focus'])

  def phase = focus == 'flare' ? 'flare' : 'window'

  def kind = debrief.track&.skydive? ? 'skydive' : 'base'

  def other_id = comparison['other_track_id']

  def substitute(text)
    text.gsub('FROM', comparison['from'].to_s).gsub('TO m', "#{comparison['to']} m").gsub('OTHER', other_id.to_s)
  end

  def focus_notes = focus == 'flare' ? PARTS.fetch('flare') : [TASKS.fetch(focus), RUN_UP.strip].join(' ')

  def format_text
    substitute(FORMAT_TEXT.sub('PHASE', phase).sub('REPLAY', REPLAYS.fetch(phase)).sub('CHARTS', CHARTS.fetch(phase)))
      .sub('METRIC_KEYS', metric_keys)
  end

  def metric_keys
    return FLARE_KEYS if focus == 'flare'

    [WINDOW_KEYS.sub('CHECKPOINTS', Track::FlightMetrics::PERFORMANCE_CHECKPOINTS.join(', ')), PERFORMANCE_KEYS]
      .join(', ')
  end

  def jumps = { 'self' => debrief.inputs['jump'], "track:#{other_id}" => debrief.evidence.dig('tracks', other_id.to_s) }

  def summary
    jumps.transform_values do |jump|
      jump.except('metrics').merge(phase => jump.dig('metrics', phase)&.except('series'))
    end
  end

  def series
    step = SERIES_STEPS.fetch(phase)
    jumps.transform_values do |jump|
      rows = jump.dig('metrics', phase, 'series').to_a
      rows.each_with_object([]) do |row, picked|
        picked << row.map { |value| value.round(1) } if picked.empty? || row.first - picked.last.first >= step - 0.01
      end
    end
  end
end
