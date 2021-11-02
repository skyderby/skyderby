module EventTracks
  class FileDuplicationValidator
    def self.call(*args)
      new(*args).call
    end

    def initialize(result, track_file)
      @result = result
      @track_file = track_file
    end

    def call
      return false unless duplicate

      result.errors.add(:base, I18n.t('errors.messages.duplicate_file',
                                      pilot_name: pilot_name,
                                      round: round_presentation))

      true
    end

    private

    attr_reader :result, :track_file

    def pilot_name
      track.pilot_name
    end

    def round_presentation
      "#{round.discipline.humanize} - #{round.number}"
    end

    def round
      @round ||= track.event_result.round
    end

    def track
      @track ||= duplicate.track
    end

    def duplicate
      @duplicate ||=
        Track::File
        .joins(track: [event_result: [round: :event]])
        .where("file_data->'metadata'->>'md5' = ?", track_file.file.metadata['md5'])
        .where('events.id' => result.event_id)
        .where.not(id: track_file.id)
        .first
    end
  end
end
