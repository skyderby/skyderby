class Track::Debrief::Comparison
  STRATEGY = 'comparison'.freeze

  attr_reader :track, :other, :from, :to

  def initialize(track, other, from:, to:)
    @track = track
    @other = other
    @from = from.to_i
    @to = to.to_i
  end

  def self.from_debrief(debrief)
    window = debrief.inputs['comparison'].to_h
    new(debrief.track, debrief.other_track, from: window['from'], to: window['to'])
  end

  def key = "comparison-#{other.id}-#{from}-#{to}"

  def valid? = other.present? && other != track && from > to

  def inputs
    {
      'comparison' => { 'other_track_id' => other.id, 'from' => from, 'to' => to },
      'discipline' => { 'parts' => [] },
      'pilot' => { 'name' => track.pilot&.name },
      'jump' => info(track).merge('metrics' => metrics(track)),
      'references' => [],
      'thresholds' => []
    }
  end

  def evidence = { 'tracks' => { other.id.to_s => info(other).merge('metrics' => metrics(other)) } }

  private

  def window_spec = { 'kind' => 'distance', 'performance' => true, 'from_altitude' => from, 'to_altitude' => to }

  def metrics(jump)
    @metrics ||= {}
    @metrics[jump.id] ||= Track::FlightMetrics.new(jump, window_spec:, flare: false).to_h
  end

  def info(jump)
    { 'track_id' => jump.id, 'pilot' => jump.pilot&.name, 'suit' => jump.suit&.name, 'place' => jump.place&.name,
      'date' => jump.recorded_at.to_date.iso8601 }
  end
end
