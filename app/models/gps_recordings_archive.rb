class GpsRecordingsArchive < ApplicationRecord
  include ArchiveUploader::Attachment.new(:file)

  belongs_to :event, polymorphic: true

  enum :status, { idle: 0, in_progress: 1, complete: 2 }

  def create_archive!
    update!(status: :in_progress)

    zip_content = generate_zip_content
    return if zip_content.blank?

    filename = "gps-recordings-#{event.name.parameterize}-#{Time.current.to_i}.zip"

    file_io = StringIO.new(zip_content)
    file_io.define_singleton_method(:original_filename) { filename }
    file_io.define_singleton_method(:content_type) { 'application/zip' }

    self.file = file_io
    save!
    update!(status: :complete)
  end

  private

  def generate_zip_content
    zip_stream = Zip::OutputStream.write_buffer do |zip|
      write_files_to_archive(zip)
    end

    zip_stream.rewind
    zip_stream.read
  end

  def write_files_to_archive(zip)
    results.find_each do |result|
      next unless result.track&.track_file&.file

      file = result.track.track_file.file
      competitor = result.competitor
      round = result.round

      filename = build_filename(competitor, round, file)

      file.open do |tempfile|
        zip.put_next_entry(filename)
        zip.write(tempfile.read)
      end
    end
  end

  def build_filename(competitor, round, file)
    [
      competitor.assigned_number,
      competitor.name.tr(' ', '_'),
      round.code,
      file.metadata['filename'] || 'track.csv'
    ].compact_blank.join('_')
  end

  def results
    event.results.includes(
      :round,
      competitor: :profile,
      track: :track_file
    )
  end
end
