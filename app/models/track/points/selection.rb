class Track::Points::Selection
  include Enumerable

  delegate_missing_to :to_a

  def initialize(recording, from: nil, to: nil, freq_1hz: false)
    @recording = recording
    @from = from
    @to = to
    @freq_1hz = freq_1hz
  end

  def extended(before: 0, after: 0)
    rebuild(from: @from && (@from - before.to_r), to: @to && (@to + after.to_r))
  end

  def at_1hz = rebuild(freq_1hz: true)

  def each(&) = to_a.each(&)

  def to_a
    @to_a ||= @recording ? @recording.points(range: (@from..@to if @from && @to), freq_1hz: @freq_1hz) : []
  end

  private

  def rebuild(**changes)
    self.class.new(@recording, from: @from, to: @to, freq_1hz: @freq_1hz, **changes)
  end
end
