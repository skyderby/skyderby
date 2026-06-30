require 'test_helper'

class Track::FileTest < ActiveSupport::TestCase
  test 'is invalid without a file' do
    track_file = Track::File.new

    assert_not track_file.valid?
    assert_includes track_file.errors[:file], "can't be blank"
  end

  test 'is valid with an attached file' do
    track_file = Track::File.new(file: File.open(file_fixture('tracks/flysight.csv')))

    assert_predicate track_file, :valid?
  end
end
