describe SpeedSkydivingCompetition::Result do
  let(:record) { speed_skydiving_competition_results(:hinton_round_1) }

  describe '#penalty_size' do
    it 'with no penalties' do
      expect(record.penalty_size).to eq(0)
    end

    it 'with single penalty' do
      record.penalties.create!(percent: 20, reason: 'some reason')

      expect(record.penalty_size).to eq(20)
    end

    it 'with multiple penalties' do
      record.penalties.create!(percent: 20, reason: 'some reason')
      record.penalties.create!(percent: 50, reason: 'much stronger reason')

      expect(record.penalty_size).to eq(60)
    end
  end

  describe '#final_result' do
    before do
      record.result = 500
    end

    it 'with no penalties' do
      expect(record.final_result).to eq(500)
    end

    it 'with single penalty' do
      record.penalties.create!(percent: 20, reason: 'some reason')

      expect(record.final_result).to eq(400)
    end

    it 'with multiple penalties' do
      record.penalties.create!(percent: 20, reason: 'some reason')
      record.penalties.create!(percent: 50, reason: 'much stronger reason')

      expect(record.final_result).to eq(200)
    end
  end

  describe 'round in progress validation' do
    it 'update is not allowed' do
      record.round.update!(completed_at: Time.zone.today)

      update_successful = record.update(result: 250)

      expect(update_successful).to be_falsey
      expect(record.errors.of_kind?(:base, :round_completed)).to be_truthy
    end

    it 'destroy is not allowed' do
      record.round.update!(completed_at: Time.zone.today)

      record.destroy

      expect(record.destroyed?).to be_falsey
    end
  end
end
