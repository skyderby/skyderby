require 'shrine'
require 'shrine/storage/file_system'
require 'shrine/storage/s3'

s3_options = {
  bucket: ENV['SHRINE_S3_BUCKET'],
  region: ENV['SHRINE_S3_REGION'],
  access_key_id: ENV['SHRINE_S3_ACCESS_KEY_ID'],
  secret_access_key: ENV['SHRINE_S3_SECRET_KEY'],
  endpoint: "https://s3.#{ENV['SHRINE_S3_REGION']}.amazonaws.com"
}

Shrine.storages[:cache] = Shrine::Storage::FileSystem.new('public', prefix: 'system')
Shrine.storages[:store] =
  if !Rails.env.test? && s3_options[:bucket].present?
    Shrine::Storage::S3.new(**s3_options)
  else
    Shrine::Storage::FileSystem.new('public', prefix: 'system/uploads')
  end

Shrine.plugin :activerecord
Shrine.plugin :derivatives
Shrine.plugin :backgrounding
Shrine.plugin :cached_attachment_data
Shrine.plugin :determine_mime_type, analyzer: :marcel
Shrine.plugin :restore_cached_data
Shrine.plugin :signature

Shrine::Attacher.promote_block do
  Attachment::PromoteJob.perform_later \
    self.class.name,
    record.class.name,
    record.id,
    name.to_s,
    file_data
end

Shrine::Attacher.destroy_block do
  Attachment::DestroyJob.perform_later(self.class.name, data)
end
