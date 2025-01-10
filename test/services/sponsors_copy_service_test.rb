describe SponsorsCopyService do
  it 'copy sponsors from source to target' do
    event = create(:event)
    3.times do |_|
      create(:sponsor, sponsorable: event)
    end

    target = create(:event)
    SponsorsCopyService.new.call(source: event, target: target)

    expect(target.sponsors.pluck(:name)).to match(event.sponsors.pluck(:name))
  end

  it 'does not change source sponsors' do
    event = create(:event)
    3.times do |_|
      create(:sponsor, sponsorable: event)
    end

    target = create(:event)
    SponsorsCopyService.new.call(source: event, target: target)

    expect(event.sponsors.size).to eq(3)
  end
end
