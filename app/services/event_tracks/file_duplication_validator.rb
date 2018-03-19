module EventTracks
  class FileDuplicationValidator
    def self.call(*args)
      new(*args).call
    end

    def initialize(event_track, track_file)
      @event_track = event_track
      @track_file = track_file
    end

    def call
      return false unless duplicate

      event_track.errors.add(:base, I18n.t('errors.messages.duplicate_file',
                                    pilot_name: pilot_name,
                                    round: round_presentation))

      true
    end

    private

    attr_reader :event_track, :track_file

    def pilot_name
      track.pilot_name
    end

    def round_presentation
      "#{round.discipline.humanize} - #{round.number}"
    end

    def round
      @round ||= track.event_track.round
    end

    def track
      @track ||= duplicate.track
    end

    def duplicate
      @duplicate ||=
        TrackFile
        .joins(track: [event_track: [round: :event]])
        .where(file_file_name: track_file.file_file_name,
               file_file_size: track_file.file_file_size)
        .where('events.id' => event_track.event_id)
        .where.not(id: track_file.id)
        .first
    end
  end
end
