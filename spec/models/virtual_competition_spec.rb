# == Schema Information
#
# Table name: virtual_competitions
#
#  id                    :integer          not null, primary key
#  jumps_kind            :integer
#  suits_kind            :integer
#  place_id              :integer
#  period_from           :date
#  period_to             :date
#  discipline            :integer
#  discipline_parameter  :integer          default(0)
#  created_at            :datetime
#  updated_at            :datetime
#  name                  :string(510)
#  virtual_comp_group_id :integer
#  range_from            :integer          default(0)
#  range_to              :integer          default(0)
#  display_highest_speed :boolean
#  display_highest_gr    :boolean
#  display_on_start_page :boolean
#  default_view          :integer          default("default_overall"), not null
#

describe VirtualCompetition, type: :model do
  context '#window_params' do
    it 'returns params for distance discipline' do
      competition = VirtualCompetition.create(
        discipline: :distance,
        range_from: 3000,
        range_to: 2000
      )

      expect(competition.window_params).to eq(
        from_altitude: 3000, to_altitude: 2000
      )
    end

    it 'returns params for distance discipline' do
      competition = VirtualCompetition.create(
        discipline: :speed,
        range_from: 3000,
        range_to: 2000
      )

      expect(competition.window_params).to eq(
        from_altitude: 3000, to_altitude: 2000
      )
    end

    it 'returns params for distance discipline' do
      competition = VirtualCompetition.create(
        discipline: :time,
        range_from: 3000,
        range_to: 2000
      )

      expect(competition.window_params).to eq(
        from_altitude: 3000, to_altitude: 2000
      )
    end

    it 'returns params for distance in time' do
      competition = VirtualCompetition.create(
        discipline: :distance_in_time,
        discipline_parameter: 20
      )

      expect(competition.window_params).to eq(
        from_vertical_speed: VirtualCompetition::BASE_START_SPEED,
        duration: 20
      )
    end

    it 'returns params for distance in time' do
      competition = VirtualCompetition.create(
        discipline: :distance_in_altitude,
        discipline_parameter: 200
      )

      expect(competition.window_params).to eq(
        from_vertical_speed: VirtualCompetition::BASE_START_SPEED,
        elevation: 200
      )
    end
  end

  context '#task' do
    it 'returns right task for distance in time' do
      competition = VirtualCompetition.create(discipline: :distance_in_time)

      expect(competition.task).to eq('distance')
    end

    it 'returns right task for distance in altitude' do
      competition = VirtualCompetition.create(discipline: :distance_in_altitude)

      expect(competition.task).to eq('distance')
    end
  end
end
