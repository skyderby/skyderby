class EventResultService
  def initialize(track, round, wind_cancellation = false)
    @track = track
    @event = round.event
    @points = Skyderby::Tracks::Points.new(@track)

    subtract_wind if wind_cancellation

    @discipline = round.discipline.to_sym
    @params = {
      range_from: @event.range_from,
      range_to: @event.range_to
    }
  end

  def calculate
    Skyderby::ResultsProcessor.new(@points, @discipline, @params).execute
  end

  private

  def subtract_wind
    wind_data = Skyderby::WindCancellation::WindData.new(@event.weather_data)
    @points = Skyderby::WindCancellation::WindSubtraction(@points, wind_data).execute
  end
end
