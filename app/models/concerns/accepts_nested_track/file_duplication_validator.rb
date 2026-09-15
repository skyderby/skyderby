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
      result.event.results.joins(track: { track_file: { file_attachment: :blob } })
            .includes(competitor: :profile)
            .where(active_storage_blobs: { checksum: track_file.file.checksum })
            .where.not(track_files: { id: track_file.id })
            .first
    end
  end
end
