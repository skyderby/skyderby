require 'spec_helper'

describe RangesToScoreFinder do
  describe 'BASE activity' do
    it 'returns same range as given bounds' do
      altitude_bounds = { max_altitude: 3000, min_altitude: -30 }
      ranges_finder = RangesToScoreFinder.new(altitude_bounds, :base)
      ranges_to_score = ranges_finder.calculate

      expect(ranges_to_score.size).to eq(1)
      expect(ranges_to_score.first).to eq({
        start_altitude: altitude_bounds[:max_altitude],
        end_altitude: altitude_bounds[:min_altitude]
      })
    end
  end

  describe 'Skydive activity' do
    it 'returns same range as given bounds if height diff < 1000' do
      altitude_bounds = { max_altitude: 3000, min_altitude: 2700 }
      ranges_finder = RangesToScoreFinder.new(altitude_bounds, :skydive)
      ranges_to_score = ranges_finder.calculate

      expect(ranges_to_score.size).to eq(1)
      expect(ranges_to_score.first).to eq({
        start_altitude: altitude_bounds[:max_altitude],
        end_altitude: altitude_bounds[:min_altitude]
      })
    end

    it 'returns min skydive altitude if min in given bounds is lower' do
      altitude_bounds = { max_altitude: 1500, min_altitude: 500 }
      ranges_finder = RangesToScoreFinder.new(altitude_bounds, :skydive)
      ranges_to_score = ranges_finder.calculate

      expect(ranges_to_score.size).to eq(1)
      expect(ranges_to_score.first).to eq({
        start_altitude: altitude_bounds[:max_altitude],
        end_altitude: RangesToScoreFinder::MINIMUM_SKYDIVE_ALTITUDE
      })
    end

    it 'splits given range by 1000 m ranges with defined step' do
      altitude_bounds = { max_altitude: 2200, min_altitude: 900 }
      ranges_finder = RangesToScoreFinder.new(altitude_bounds, :skydive)
      ranges_to_score = ranges_finder.calculate
      
      expect(ranges_to_score.size).to eq(4)
      expect(ranges_to_score).to eq([
        { start_altitude: 2200, end_altitude: 1200 },
        { start_altitude: 2150, end_altitude: 1150 },
        { start_altitude: 2100, end_altitude: 1100 },
        { start_altitude: 2050, end_altitude: 1050 }
      ])
    end

    it 'returns blank array if height diff <=0' do
      altitude_bounds = { max_altitude: 0, min_altitude: 0 }
      ranges_finder = RangesToScoreFinder.new(altitude_bounds, :skydive)
      ranges_to_score = ranges_finder.calculate

      expect(ranges_to_score.size).to eq(0)
    end
  end
end
