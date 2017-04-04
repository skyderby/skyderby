FactoryGirl.define do
  factory :sponsor do
    sequence(:name) { |n| "Sponsor-#{n}" }
    website 'www.example.com'
    logo { Rack::Test::UploadedFile.new "#{Rails.root}/spec/support/skyderby_logo.png", 'image/png' }
    sponsorable factory: :event
  end
end
