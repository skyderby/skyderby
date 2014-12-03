class Round < ActiveRecord::Base
  belongs_to :event
  has_many :event_tracks

  enum discipline: [:time, :distance, :speed]

  def name_with_discipline
    self.discipline.to_s.humanize + ' - ' + self.name
  end

end
