describe Announcement do
  it 'scope active' do
    described_class.create!(
      name: 'Past',
      text: 'Past',
      period_from: 3.weeks.ago,
      period_to: 2.weeks.ago
    )

    described_class.create!(
      name: 'Current',
      text: 'Current',
      period_from: 1.week.ago,
      period_to: 1.week.from_now
    )

    active_announcements = described_class.active.map(&:name)

    expect(active_announcements).to include('Current')
    expect(active_announcements).not_to include('Past')
  end

  it '#to_html' do
    announcement = described_class.create! \
      name: 'Thanks',
      text: '*Thank you* for supporting [Skyderby](https://skyderby.ru)',
      period_from: 1.week.ago,
      period_to: 1.week.from_now

    result = announcement.to_html.strip

    expect(result).to eq(
      '<p><em>Thank you</em> for supporting <a href="https://skyderby.ru">Skyderby</a></p>'
    )
  end
end
