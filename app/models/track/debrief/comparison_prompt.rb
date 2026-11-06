class Track::Debrief::ComparisonPrompt
  include Track::Debrief::PromptParts

  SERIES_STEP = 1.0
  OPENING = 'You are a wingsuit coach on Skyderby, a GPS track analysis site.'.freeze

  TASK = <<~TEXT.freeze
    The pilot compares two jumps in Skyderby's Pro View, their own jump and a second one, in the same altitude window,
    and asks what the difference is and what it means for their flying. The window here is not a ranking window: it
    is the range the pilot chose on screen, from FROM to TO m, and the run-up from exit to it.

    What a good comparison does:
    - It opens with the one difference that matters most, in a sentence or two.
    - It explains the three to five differences that matter most, the biggest first, and shows each one with a replay
      of both jumps that stops at the moments where the difference appears.
    - It reads the jumps the way Pro View shows them: the run-up, the entry, the segments of the window and how speeds
      change, so the pilot can find the same thing on screen.
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

  FORMAT_TEXT = <<~TEXT.freeze
    Format: Markdown with the tags below, no tables, no other HTML, no title at the top. Measured values are printed
    with tags, never typed as digits; values read off the series are plain text, rounded ("about 120 km/h").
    - <metric key="KEY" of="WHO"/> prints a measured value with its unit. WHO is "self" (the pilot's jump) or
      "track:OTHER" (the second jump). KEY is METRIC_KEYS.
    - A replay, on its own lines:
        <replay phase="window" with="track:OTHER">
        <moment at="SECONDS" label="LABEL">One or two sentences about this moment.</moment>
        </replay>
      An animated side view of both jumps that stops at each moment; height lost against distance, at is seconds
      from the window start, negative in the run-up, or "end". Use three to five moments in time order with short
      labels. Inside moment text wrap each jump's numbers in <v of="WHO">...</v>, for example: you sink at
      <v of="self">45 km/h</v>, the second jump at <v of="track:OTHER">38</v>. No other tags or markdown inside.
    - Charts, each on its own line: <chart name="window_gap" with="track:OTHER"/> (how much lower the pilot is than
      the second jump at the checkpoints) and <chart name="window_speed" with="track:OTHER"/> (horizontal speed over
      time).
  TEXT

  def initialize(debrief)
    @debrief = debrief
  end

  def system
    window = debrief.inputs['comparison']
    [OPENING, KINDS.fetch(kind), substitute(TASK, window), RUN_UP.strip, MOVING_AIR, WORDS_TEXT,
     substitute(FORMAT_TEXT, window).sub('METRIC_KEYS', metric_keys), (READER unless debrief.read_by_pilot?)]
      .compact.join("\n")
  end

  def user_message
    <<~MESSAGE
      Write in English.

      The pilot's jump (self) and the second jump (track:#{other_id}):
      #{JSON.pretty_generate(summary)}

      Window series, one row per second: [seconds from the window start, metres lost, metres from the window start,
      horizontal km/h, vertical km/h]. Negative seconds are the run-up.
      #{JSON.generate(series)}
    MESSAGE
  end

  private

  attr_reader :debrief

  def kind = debrief.track&.skydive? ? 'skydive' : 'base'

  def other_id = debrief.inputs.dig('comparison', 'other_track_id')

  def substitute(text, window)
    text.gsub('FROM', window['from'].to_s).gsub('TO m', "#{window['to']} m").gsub('OTHER', other_id.to_s)
  end

  def metric_keys
    [WINDOW_KEYS.sub('CHECKPOINTS', Track::FlightMetrics::PERFORMANCE_CHECKPOINTS.join(', ')), PERFORMANCE_KEYS]
      .join(', ')
  end

  def jumps = { 'self' => debrief.inputs['jump'], "track:#{other_id}" => debrief.evidence.dig('tracks', other_id.to_s) }

  def summary
    jumps.transform_values do |jump|
      jump.except('metrics').merge('window' => jump.dig('metrics', 'window')&.except('series'))
    end
  end

  def series
    jumps.transform_values do |jump|
      rows = jump.dig('metrics', 'window', 'series').to_a
      rows.each_with_object([]) do |row, picked|
        picked << row.map { |value| value.round(1) } if picked.empty? || row.first - picked.last.first >= SERIES_STEP
      end
    end
  end
end
