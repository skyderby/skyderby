require 'test_helper'

class GpsRecordingsArchiveTest < ActiveSupport::TestCase
  test 'packs uploaded track files of event results into a zip attachment' do
    event = events(:nationals)
    track_file = Track::File.create!(file: fixture_file_upload('tracks/flysight.csv', 'text/csv'))
    tracks(:hellesylt).update!(track_file:)
    archive = GpsRecordingsArchive.create!(event:)

    archive.create_archive!

    archive.reload
    assert_predicate archive, :complete?
    assert_equal 'application/zip', archive.file.content_type
    entries = []
    Zip::InputStream.open(StringIO.new(archive.file.download)) do |zip|
      while (entry = zip.get_next_entry)
        entries << entry.name
      end
    end
    assert_equal 2, entries.size
    assert(entries.all? { |name| name.end_with?('_flysight.csv') })
  end
end
