class EventResultService
  def initialize(track, round)
    @track = track
    @points = Skyderby::Tracks::Points.new(@track)
    @discipline = round.discipline.to_sym
    @params = {
      range_from: round.event.range_from,
      range_to: round.event.range_to
    }
  end

  def calculate
    Skyderby::ResultsProcessor.new(@points, @discipline, @params).execute
  end
end
