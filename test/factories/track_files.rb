# == Schema Information
#
# Table name: track_files
#
#  id                :integer          not null, primary key
#  file_file_name    :string(510)
#  file_content_type :string(510)
#  file_file_size    :integer
#  file_updated_at   :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

FactoryBot.define do
  factory :track_file, class: 'Track::File' do
    file { Rack::Test::UploadedFile.new Rails.root.join('spec/fixtures/files/tracks/flysight.csv') }
  end
end
