describe Profiles::RankingPositions do
  describe '#by_competition' do
    it 'when on first place' do
      create_data

      results = Profiles::RankingPositions.new(@vasya_profile).by_competition

      _competition, scores = results.first

      profile_names = scores.map { |x| x.profile.name }

      expect(profile_names).to eq(%w[Vasya Petya Ilya])
    end

    it 'when on last place' do
      create_data

      results = Profiles::RankingPositions.new(@kolya_profile).by_competition

      _competition, scores = results.first

      profile_names = scores.map { |x| x.profile.name }

      expect(profile_names).to eq(%w[Ilya Misha Kolya])
    end

    it 'when in the middle' do
      create_data

      results = Profiles::RankingPositions.new(@ilya_profile).by_competition

      _competition, scores = results.first

      profile_names = scores.map { |x| x.profile.name }

      expect(profile_names).to eq(%w[Petya Ilya Misha])
    end

    def create_data
      competition = virtual_competitions(:base_race)

      @vasya_profile = create :profile, name: 'Vasya'
      track = create :empty_track, pilot: @vasya_profile
      create :virtual_competition_result,
             virtual_competition: competition,
             track: track,
             result: 100

      @petya_profile = create :profile, name: 'Petya'
      track = create :empty_track, pilot: @petya_profile
      create :virtual_competition_result,
             virtual_competition: competition,
             track: track,
             result: 90

      @ilya_profile = create :profile, name: 'Ilya'
      track = create :empty_track, pilot: @ilya_profile
      create :virtual_competition_result,
             virtual_competition: competition,
             track: track,
             result: 90

      @misha_profile = create :profile, name: 'Misha'
      track = create :empty_track, pilot: @misha_profile
      create :virtual_competition_result,
             virtual_competition: competition,
             track: track,
             result: 90

      @kolya_profile = create :profile, name: 'Kolya'
      track = create :empty_track, pilot: @kolya_profile
      create :virtual_competition_result,
             virtual_competition: competition,
             track: track,
             result: 80
    end
  end
end
