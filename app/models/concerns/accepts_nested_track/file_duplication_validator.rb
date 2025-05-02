module AcceptsNestedTrack
  class FileDuplicationValidator
    def validate(result, track_file)
      duplicate = find_duplicate(result, track_file)
      return unless duplicate

      pilot_name = duplicate.competitor.name
      round = duplicate.round.presentation
      result.errors.add(:base, I18n.t('errors.messages.duplicate_file', pilot_name:, round:))
    end

    private

    def find_duplicate(result, track_file)
      result.event.results.joins(track: :track_file)
            .includes(competitor: :profile)
            .where("file_data->'metadata'->>'md5' = ?", track_file.file.metadata['md5'])
            .where.not(id: track_file.id)
            .first
    end
  end
end
