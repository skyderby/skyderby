require 'test_helper'

class SponsorsCopyServiceTest < ActiveSupport::TestCase
  setup do
    @source_event = create(:event).tap do |event|
      3.times do |idx|
        logo = fixture_file_upload('skyderby_logo.png')
        event.sponsors.create!(name: "Sponsor-#{idx}", website: 'www.example.com', logo:)
      end
    end
    @target_event = create(:event)
  end

  test 'copy sponsors from source to target' do
    SponsorsCopyService.new.call(source: @source_event, target: @target_event)
    assert_equal @target_event.sponsors.pluck(:name), @source_event.sponsors.pluck(:name)
  end

  test 'does not change source sponsors' do
    SponsorsCopyService.new.call(source: @source_event, target: @target_event)
    assert_equal 3, @source_event.sponsors.size
  end
end
