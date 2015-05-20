class Round < ActiveRecord::Base
  enum discipline: [:time, :distance, :speed]

  belongs_to :event
  has_many :event_tracks, dependent: :restrict_with_error

  validates_presence_of :event, :discipline

  before_create :set_name

  private

  def set_name
    # Раунды нумеруются последовательно в пределах соревнований и дисциплины
    rounds = Round.where(
      event_id: event_id,
      discipline: Round.disciplines[discipline]
    ).to_a

    current_number = rounds.map { |x| x.name.to_i }.max || 0
    self.name = (current_number + 1).to_s
  end
end
