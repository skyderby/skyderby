class EventTrack < ActiveRecord::Base
  belongs_to :track
  belongs_to :round
  belongs_to :competitor

  before_save :calc_result

  def calc_result

    discipline = self.round.discipline
    comp_range_from = self.round.event.comp_range_from
    comp_range_to = self.round.event.comp_range_to

    if discipline.eql? Discipline.time
      self.result = calc_time self.track, comp_range_from, comp_range_to
    elsif discipline.eql? Discipline.distance
      self.result = calc_distance self.track, comp_range_from, comp_range_to
    elsif discipline.eql? Discipline.speed
      self.result = calc_speed self.track, comp_range_from, comp_range_to
    end

  end

  private

  def calc_time(track, range_from, range_to)
    track.calc_results(range_from, range_to)[:fl_time]
  end

  def calc_distance(track, range_from, range_to)
    track.calc_results(range_from, range_to)[:distance]
  end

  def calc_speed(track, range_from, range_to)
    track.calc_results(range_from, range_to)[:speed]
  end

end
