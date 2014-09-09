class Round < ActiveRecord::Base
  belongs_to :event
  has_many :event_tracks
  belongs_to :discipline

  def name_with_discipline
    self.discipline.name + ' - ' + self.name
  end
end
