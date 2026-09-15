require 'test_helper'

class HasAttachmentsTest < ActiveSupport::TestCase
  test 'stores new uploads under a readable key' do
    sponsor = create_sponsor(logo: fixture_file_upload('skyderby_logo.png', 'image/png'))

    assert_match %r{\Asponsor/#{sponsor.id}/logo/\d{17}-skyderby_logo\.png\z}, sponsor.logo.blob.key
  end

  test 'stores replacement uploads under a new key' do
    sponsor = create_sponsor(logo: fixture_file_upload('skyderby_logo.png', 'image/png'))
    first_key = sponsor.logo.blob.key

    travel 1.second do
      sponsor.update!(logo: fixture_file_upload('profile_userpic.png', 'image/png'))
    end

    assert_match %r{\Asponsor/#{sponsor.id}/logo/\d{17}-profile_userpic\.png\z}, sponsor.reload.logo.blob.key
    assert_not_equal first_key, sponsor.logo.blob.key
  end

  test 'keeps the key of an existing blob when it is attached to another record' do
    source = create_sponsor(logo: fixture_file_upload('skyderby_logo.png', 'image/png'))
    copy = create_sponsor(logo: source.logo.blob)

    assert_equal source.logo.blob.key, copy.logo.blob.key
  end

  test 'stores processed variants next to the original' do
    profile = profiles(:alex)
    profile.update!(userpic: fixture_file_upload('profile_userpic.png', 'image/png'))

    variant = profile.userpic.variant(:thumb).processed

    original = profile.userpic.blob.key.delete_suffix('.png')
    assert_match %r{\A#{Regexp.escape(original)}\.variants/\h+\.webp\z}, variant.image.blob.key
  end

  test 'returns the default url when nothing is attached' do
    profile = profiles(:alex)

    assert_equal '/images/thumb/missing.png', profile.userpic_url(:thumb)
    assert_equal '/images/original/missing.png', profile.userpic_url
    assert_nil event_competitors(:john).photo_url(:medium)
  end

  test 'returns representation and blob paths when attached' do
    profile = profiles(:alex)
    profile.update!(userpic: fixture_file_upload('profile_userpic.png', 'image/png'))

    assert_match %r{\A/rails/active_storage/representations/redirect/}, profile.userpic_url(:thumb)
    assert_match %r{\A/rails/active_storage/blobs/redirect/}, profile.userpic_url
  end

  test 'does not build urls for blobs that are not saved yet' do
    profile = profiles(:alex)
    profile.userpic = fixture_file_upload('profile_userpic.png', 'image/png')

    assert_equal '/images/medium/missing.png', profile.userpic_url(:medium)
  end

  test 'rejects files that are too large or of an unsupported type' do
    track_file = Track::File.new(file: { io: StringIO.new('x' * 4.megabytes), filename: 'big.csv' })
    assert_not track_file.valid?
    assert_includes track_file.errors.details[:file], { error: :file_too_large, size: '3 MB' }

    sponsor = Sponsor.new(name: 'S', website: 'example.com', sponsorable: events(:nationals),
                          logo: fixture_file_upload('tracks/flysight.csv', 'text/csv'))
    assert_not sponsor.valid?
    assert_includes sponsor.errors.details[:logo], { error: :file_type_invalid }
  end

  test 'crops the userpic before storing it' do
    profile = profiles(:alex)
    profile.assign_attributes(userpic: fixture_file_upload('profile_userpic.png', 'image/png'),
                              crop_x: 0, crop_y: 0, crop_w: 10, crop_h: 12)
    profile.save!

    metadata = profile.userpic.blob.tap(&:analyze).metadata
    assert_equal [10, 12], [metadata['width'], metadata['height']]
  end

  test 'track file source reads a file that is not uploaded yet' do
    content = file_fixture('tracks/flysight.csv').read

    Track::File.transaction do
      track_file = Track::File.create!(file: fixture_file_upload('tracks/flysight.csv', 'text/csv'))
      reloaded = Track::File.find(track_file.id)

      assert_equal content, track_file.source.content
      assert_raises(ActiveStorage::FileNotFoundError) { reloaded.source.content }
      raise ActiveRecord::Rollback
    end
  end

  test 'track file source downloads a stored file' do
    track_file = Track::File.create!(file: fixture_file_upload('tracks/flysight.csv', 'text/csv'))

    assert_equal file_fixture('tracks/flysight.csv').read, Track::File.find(track_file.id).source.content
  end

  private

  def create_sponsor(logo:)
    Sponsor.create!(name: 'Sponsor', website: 'example.com', sponsorable: events(:nationals), logo:)
  end
end
