require 'test_helper'

class AnnouncementTest < ActiveSupport::TestCase
  test 'scope active' do
    Announcement.create!(
      name: 'Past',
      text: 'Past',
      period_from: 3.weeks.ago,
      period_to: 2.weeks.ago
    )

    Announcement.create!(
      name: 'Current',
      text: 'Current',
      period_from: 1.week.ago,
      period_to: 1.week.from_now
    )

    active_announcements = Announcement.active.map(&:name)

    assert_includes active_announcements, 'Current'
    assert_not_includes active_announcements, 'Past'
  end

  test '#to_html' do
    thanks_announcement = Announcement.create!(
      name: 'Thanks',
      text: '*Thank you* for supporting [Skyderby](https://skyderby.ru)',
      period_from: 1.week.ago,
      period_to: 1.week.from_now
    )

    result = thanks_announcement.to_html.strip

    assert_equal '<p><em>Thank you</em> for supporting <a href="https://skyderby.ru">Skyderby</a></p>', result
  end
end
