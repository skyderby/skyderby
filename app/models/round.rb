class Round < ActiveRecord::Base
  belongs_to :event
  has_many :event_tracks

  enum discipline: [:time, :distance, :speed]

  validates_presence_of :event, :discipline

  before_create :set_name
  def set_name
    rounds = Round.where(event_id: event_id, discipline: Round.disciplines[discipline]).to_a
    self.name = ((rounds.map{ |x| x.name.to_i }.max || 0 ) + 1).to_s
  end
end
