require 'test_helper'

class Attachment::KeyNormalizationTest < ActiveSupport::TestCase
  setup do
    @service = ActiveStorage::Blob.service
  end

  test 'keeps keys that already follow the canonical scheme' do
    sponsor = Sponsor.create!(name: 'S', website: 'example.com', sponsorable: events(:nationals),
                              logo: fixture_file_upload('skyderby_logo.png', 'image/png'))

    result = normalize

    assert_empty result.moved
    assert_match %r{\Asponsor/#{sponsor.id}/logo/}, sponsor.logo.blob.reload.key
  end

  test 'moves legacy keys under the record scoped prefix' do
    track_file = legacy_track_file('trackfile/1/file/TRACK.CSV')

    result = normalize

    blob = track_file.file.blob.reload
    assert_equal "track_file/#{track_file.id}/file/TRACK.CSV", blob.key
    assert @service.exist?(blob.key)
    assert @service.exist?('trackfile/1/file/TRACK.CSV')
    assert_equal([['trackfile/1/file/TRACK.CSV', blob.key]], result.moved.map { |move| [move.from, move.to] })
  end

  test 'moves variants next to the renamed original' do
    profile = profiles(:alex)
    blob = upload_blob('profile/userpic/large-legacy.png', file_fixture('profile_userpic.png').binread, 'userpic.png')
    profile.userpic.attach(blob)
    legacy_variant = profile.userpic.variant(:thumb).processed.image.blob.key

    normalize

    original = profile.userpic.blob.reload.key
    variant = ActiveStorage::VariantRecord.find_by!(blob_id: blob.id).image.blob.key
    assert_equal "profile/#{profile.id}/userpic/userpic.png", original
    assert_match %r{\Aprofile/#{profile.id}/userpic/userpic\.variants/\h{40}\.webp\z}, variant
    assert_not_equal legacy_variant, variant
    assert @service.exist?(variant)
  end

  test 'dry run reports moves without changing anything' do
    profile = profiles(:alex)
    blob = upload_blob('profile/userpic/large-dry.png', file_fixture('profile_userpic.png').binread, 'userpic.png')
    profile.userpic.attach(blob)
    profile.userpic.variant(:thumb).processed

    result = normalize(dry_run: true)

    assert_equal 2, result.moved.size
    assert_equal 'profile/userpic/large-dry.png', blob.reload.key
  end

  test 'reports conflicts instead of overwriting another blob' do
    track_file = legacy_track_file('trackfile/2/file/A.CSV')
    upload_blob("track_file/#{track_file.id}/file/A.CSV", 'other', 'A.CSV')

    result = normalize

    assert_equal ['trackfile/2/file/A.CSV'], result.conflicts.map(&:from)
    assert_equal 'trackfile/2/file/A.CSV', track_file.file.blob.reload.key
  end

  test 'copies full size profile originals kept from Shrine' do
    profile = profiles(:john)
    @service.upload('profile/77/userpic/abc123', StringIO.new('png'))
    data = { id: 'profile/77/userpic/abc123', storage: 'store', metadata: { mime_type: 'image/png' } }
    Profile.where(id: profile.id).update_all(['userpic_data = ?', data.to_json])

    result = normalize

    assert @service.exist?("profile/#{profile.id}/userpic/original.png")
    assert_includes result.moved.map(&:to), "profile/#{profile.id}/userpic/original.png"
  end

  private

  def normalize(dry_run: false)
    Attachment::KeyNormalization.call(service_name: @service.name, dry_run:)
  end

  def upload_blob(key, content, filename)
    @service.upload(key, StringIO.new(content))
    ActiveStorage::Blob.create!(key:, filename:, byte_size: content.bytesize,
                                checksum: Digest::MD5.base64digest(content), service_name: @service.name,
                                content_type: Marcel::MimeType.for(name: filename))
  end

  def legacy_track_file(key)
    content = file_fixture('tracks/flysight.csv').read
    Track::File.new.tap do |track_file|
      track_file.save!(validate: false)
      track_file.file.attach(upload_blob(key, content, File.basename(key)))
    end
  end
end
