class EventDeletion
  def self.execute(event, options = {})
    new(event, options).execute
  end

  def initialize(event, options = {})
    @event = event
    @delete_tracks = options[:delete_tracks] || false
  end

  def execute
    @event.transaction do
      tracks = @event.tracks.to_a

      @event.results.to_a.each(&:destroy!)
      tracks.each(&:destroy!) if delete_tracks

      @event.rounds.destroy_all
      @event.competitors.destroy_all
      @event.sections.destroy_all

      @event.destroy!
    end
  end

  private

  attr_reader :delete_tracks
end
