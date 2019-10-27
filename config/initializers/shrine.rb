require 'shrine'
require 'shrine/storage/file_system'
require 'shrine/storage/s3'

s3_options = {
  bucket: ENV['SHRINE_S3_BUCKET'],
  region: ENV['SHRINE_S3_REGION'],
  access_key_id: ENV['SHRINE_S3_ACCESS_KEY'],
  secret_access_key: ENV['SHRINE_S3_SECRET_KEY']
}

Shrine.storages = {
  cache: Shrine::Storage::FileSystem.new('public', prefix: 'system'),
  store: Shrine::Storage::S3.new(**s3_options)
}

Shrine.plugin :activerecord
Shrine.plugin :cached_attachment_data
Shrine.plugin :restore_cached_data
