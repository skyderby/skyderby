FactoryBot.define do
  factory :track_file do
    file { Rack::Test::UploadedFile.new Rails.root.join('spec', 'support', 'tracks', 'flysight.csv') }
  end
end
