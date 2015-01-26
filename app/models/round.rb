class Round < ActiveRecord::Base
  belongs_to :event
  has_many :event_tracks

  enum discipline: [:time, :distance, :speed]

  validates_presence_of :event, :name, :discipline

  def name_with_discipline
    discipline.to_s.humanize + ' - ' + name
  end
end
