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
end
