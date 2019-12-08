# == Schema Information
#
# Table name: sponsors
#
#  id                :integer          not null, primary key
#  name              :string(510)
#  logo_file_name    :string(510)
#  logo_content_type :string(510)
#  logo_file_size    :integer
#  logo_updated_at   :datetime
#  website           :string(510)
#  sponsorable_id    :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  sponsorable_type  :string
#

FactoryBot.define do
  factory :sponsor do
    sequence(:name) { |n| "Sponsor-#{n}" }
    website { 'www.example.com' }
    logo { Rack::Test::UploadedFile.new Rails.root.join('spec/support/skyderby_logo.png'), 'image/png' }
    sponsorable factory: :event
  end
end
