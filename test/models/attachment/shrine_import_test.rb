require 'test_helper'

class Attachment::ShrineImportTest < ActiveSupport::TestCase
  class FolderService
    attr_reader :uploads

    def initialize(root)
      @root = root
      @uploads = {}
    end

    def name = :folder

    def open(key, **, &)
      File.open(@root.join(key), 'rb', &)
    end

    def exist?(key) = @uploads.key?(key)

    def upload(key, io, checksum:)
      @uploads[key] = { body: io.read, checksum: }
    end
  end

  setup do
    @store_root = Pathname(Dir.mktmpdir)
    @cache_root = Pathname(Dir.mktmpdir)
    @service = FolderService.new(@store_root)
  end

  teardown do
    FileUtils.rm_rf([@store_root, @cache_root])
  end

  test 'imports a stored file under its Shrine key using the recorded md5' do
    track_file = create_track_file
    content = file_fixture('tracks/flysight.csv').read
    write_shrine_data(track_file, 'file_data', stored('track_file/1/file/flysight.csv', content, md5: true))

    import(source('Track::File', 'file_data', 'file'))

    blob = attachment_for(track_file, 'file').blob
    assert_equal 'track_file/1/file/flysight.csv', blob.key
    assert_equal 'flysight.csv', blob.filename.to_s
    assert_equal Digest::MD5.base64digest(content), blob.checksum
    assert_equal content.bytesize, blob.byte_size
    assert blob.metadata['shrine_import']
  end

  test 'computes the checksum from the stored file when md5 is not recorded' do
    sponsor = create_sponsor
    content = file_fixture('skyderby_logo.png').binread
    put_store('sponsor/1/logo/abc.png', content)
    write_shrine_data(sponsor, 'logo_data', stored('sponsor/1/logo/abc.png', content, mime_type: 'image/png'))

    import(source('Sponsor', 'logo_data', 'logo'))

    assert_equal Digest::MD5.base64digest(content), attachment_for(sponsor, 'logo').blob.checksum
  end

  test 'uploads files left in the Shrine cache under a record scoped key' do
    track_file = create_track_file
    content = file_fixture('tracks/flysight.csv').read
    FileUtils.mkdir_p(@cache_root.join('track_file/file'))
    File.write(@cache_root.join('track_file/file/TRACK.CSV'), content)
    data = stored('track_file/file/TRACK.CSV', content, md5: true).merge('storage' => 'cache')
    write_shrine_data(track_file, 'file_data', data)

    import(source('Track::File', 'file_data', 'file'))

    key = "track_file/#{track_file.id}/file/TRACK.CSV"
    assert_equal key, attachment_for(track_file, 'file').blob.key
    assert_equal content, @service.uploads.dig(key, :body)
  end

  test 'reports records whose files are missing' do
    track_file = create_track_file
    write_shrine_data(track_file, 'file_data',
                      stored('track_file/file/GONE.CSV', 'x', md5: true).merge('storage' => 'cache'))

    result = import(source('Track::File', 'file_data', 'file')).values.first

    assert_equal [track_file.id], result.missing
    assert_equal 0, ActiveStorage::Attachment.count
  end

  test 'uses the cropped large derivative as the profile userpic original' do
    profile = profiles(:alex)
    large = stored('profile/userpic/large-1.webp', 'webp',
                   md5: true, mime_type: 'image/webp', filename: 'image_processing20260914-1.webp')
    original = stored('profile/1/userpic/original', 'png', md5: true)
    write_shrine_data(profile, 'userpic_data', original.merge('derivatives' => { 'large' => large }))

    import(source('Profile', 'userpic_data', 'userpic', original_derivative: 'large'))

    blob = attachment_for(profile, 'userpic').blob
    assert_equal 'profile/userpic/large-1.webp', blob.key
    assert_equal 'userpic.webp', blob.filename.to_s
    assert_equal 'image/webp', blob.content_type
  end

  test 'skips attachments that are already imported' do
    track_file = create_track_file
    write_shrine_data(track_file, 'file_data', stored('track_file/1/file/a.csv', 'a', md5: true))
    import(source('Track::File', 'file_data', 'file'))

    result = import(source('Track::File', 'file_data', 'file')).values.first

    assert_equal 0, result.imported
    assert_equal 1, result.skipped
    assert_equal 1, ActiveStorage::Attachment.where(record: track_file).count
  end

  test 'replaces an imported attachment when the Shrine file changed' do
    track_file = create_track_file
    write_shrine_data(track_file, 'file_data', stored('track_file/1/file/a.csv', 'a', md5: true))
    import(source('Track::File', 'file_data', 'file'))
    write_shrine_data(track_file, 'file_data', stored('track_file/1/file/b.csv', 'b', md5: true))

    result = import(source('Track::File', 'file_data', 'file')).values.first

    assert_equal 1, result.replaced
    assert_equal 'track_file/1/file/b.csv', attachment_for(track_file, 'file').blob.key
  end

  test 'keeps attachments uploaded through Active Storage' do
    track_file = create_track_file
    write_shrine_data(track_file, 'file_data', stored('track_file/1/file/a.csv', 'a', md5: true))
    blob = ActiveStorage::Blob.create!(key: 'native/key.csv', filename: 'native.csv', byte_size: 1, checksum: 'x',
                                       service_name: 'test')
    ActiveStorage::Attachment.create!(name: 'file', record: track_file, blob:)

    result = import(source('Track::File', 'file_data', 'file')).values.first

    assert_equal 1, result.skipped
    assert_equal 'native/key.csv', attachment_for(track_file, 'file').blob.key
  end

  test 'shares one blob between records pointing at the same Shrine file' do
    first = create_track_file
    second = create_track_file
    [first, second].each { |record| write_shrine_data(record, 'file_data', stored('shared/a.csv', 'a', md5: true)) }

    import(source('Track::File', 'file_data', 'file'))

    assert_equal attachment_for(first, 'file').blob_id, attachment_for(second, 'file').blob_id
  end

  test 'attaches competitor photos to the model matching the event type' do
    boogie_competitor = Boogie::Competitor.find(event_competitors(:boogie_john).id)
    performance_competitor = event_competitors(:john)
    [boogie_competitor, performance_competitor].each do |competitor|
      write_shrine_data(competitor, 'photo_data', stored("photo/#{competitor.id}.png", 'png', md5: true))
    end

    with_event = ->(klass) { klass.joins(:event) }
    import(source('PerformanceCompetition::Competitor', 'photo_data', 'photo', scope: with_event),
           source('Boogie::Competitor', 'photo_data', 'photo', scope: with_event))

    assert_equal ['Boogie::Competitor'], attachment_types(boogie_competitor.id)
    assert_equal ['PerformanceCompetition::Competitor'], attachment_types(performance_competitor.id)
  end

  test 'dry run reports without writing' do
    track_file = create_track_file
    write_shrine_data(track_file, 'file_data', stored('track_file/1/file/a.csv', 'a', md5: true))

    result = import(source('Track::File', 'file_data', 'file'), dry_run: true).values.first

    assert_equal 1, result.imported
    assert_equal 0, ActiveStorage::Attachment.count
  end

  private

  def source(model, column, name, scope: nil, original_derivative: nil)
    Attachment::ShrineImport::Source.new(model, column, name, scope, original_derivative)
  end

  def import(*sources, dry_run: false)
    Attachment::ShrineImport.call(sources:, service: @service, cache_root: @cache_root, dry_run:)
  end

  def stored(id, content, md5: false, mime_type: 'text/csv', filename: File.basename(id))
    metadata = { 'size' => content.bytesize, 'filename' => filename, 'mime_type' => mime_type }
    metadata['md5'] = Digest::MD5.hexdigest(content) if md5
    { 'id' => id, 'storage' => 'store', 'metadata' => metadata }
  end

  def put_store(key, content)
    path = @store_root.join(key)
    FileUtils.mkdir_p(path.dirname)
    File.binwrite(path, content)
  end

  def write_shrine_data(record, column, data)
    record.class.unscoped.where(id: record.id).update_all(["#{column} = ?", data.to_json])
  end

  def create_track_file
    Track::File.new.tap { |track_file| track_file.save!(validate: false) }
  end

  def create_sponsor
    Sponsor.new(name: 'Sponsor', website: 'example.com', sponsorable: events(:nationals))
           .tap { |sponsor| sponsor.save!(validate: false) }
  end

  def attachment_for(record, name)
    ActiveStorage::Attachment.find_by!(record_type: record.class.polymorphic_name, record_id: record.id, name:)
  end

  def attachment_types(record_id)
    ActiveStorage::Attachment.where(record_id:, name: 'photo').pluck(:record_type)
  end
end
