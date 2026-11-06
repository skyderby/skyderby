class Track::Debrief::Comparison
  STRATEGY = 'comparison'.freeze
  FOCUSES = %w[time distance speed flare].freeze
  DEFAULT_FOCUS = 'distance'.freeze

  attr_reader :track, :other, :from, :to, :focus

  def initialize(track, other, from:, to:, focus: DEFAULT_FOCUS)
    @track = track
    @other = other
    @from = from.to_i
    @to = to.to_i
    @focus = self.class.focus_of(focus)
  end

  def self.focus_of(value) = FOCUSES.include?(value.to_s) ? value.to_s : DEFAULT_FOCUS

  def self.from_debrief(debrief)
    settings = debrief.inputs['comparison'].to_h
    new(debrief.track, debrief.other_track, from: settings['from'], to: settings['to'], focus: settings['focus'])
  end

  def flare? = focus == 'flare'

  def phase = flare? ? 'flare' : 'window'

  def key = flare? ? "comparison-flare-#{other.id}" : "comparison-#{focus}-#{other.id}-#{from}-#{to}"

  def valid? = other.present? && other != track && (flare? || from > to)

  def measured? = [track, other].all? { |jump| metrics(jump)[phase].present? }

  def inputs
    {
      'comparison' => { 'other_track_id' => other.id, 'focus' => focus,
                        **(flare? ? {} : { 'from' => from, 'to' => to }) },
      'discipline' => { 'parts' => [] },
      'pilot' => { 'name' => track.pilot&.name },
      'jump' => info(track).merge('metrics' => metrics(track)),
      'references' => [],
      'thresholds' => []
    }
  end

  def evidence = { 'tracks' => { other.id.to_s => info(other).merge('metrics' => metrics(other)) } }

  private

  def window_spec = { 'kind' => focus, 'performance' => true, 'from_altitude' => from, 'to_altitude' => to }

  def metrics(jump)
    @metrics ||= {}
    @metrics[jump.id] ||= if flare?
                            Track::FlightMetrics.new(jump, flare: true).to_h
                          else
                            Track::FlightMetrics.new(jump, window_spec:, flare: false).to_h
                          end
  end

  def info(jump)
    { 'track_id' => jump.id, 'pilot' => jump.pilot&.name, 'suit' => jump.suit&.name, 'place' => jump.place&.name,
      'date' => jump.recorded_at.to_date.iso8601 }
  end
end
