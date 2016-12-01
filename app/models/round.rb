# == Schema Information
#
# Table name: rounds
#
#  id         :integer          not null, primary key
#  name       :string(510)
#  event_id   :integer
#  created_at :datetime
#  updated_at :datetime
#  discipline :integer
#  profile_id :integer
#

class Round < ApplicationRecord
  include EventOngoingValidation

  enum discipline: [:time, :distance, :speed]

  belongs_to :event, touch: true
  belongs_to :signed_off_by,
             class_name: 'Profile',
             foreign_key: 'profile_id'

  has_many :event_tracks, dependent: :restrict_with_error

  validates_presence_of :event, :discipline

  delegate :range_from, to: :event
  delegate :range_to, to: :event

  before_create :set_name

  def signed_off
    signed_off_by.present?
  end

  def best_result(net: false)
    value_key = net ? :result_net : :result

    event_tracks.reject(&:is_disqualified).max_by(&value_key)
  end

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
