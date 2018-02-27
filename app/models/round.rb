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
             foreign_key: 'profile_id',
             optional: true

  has_many :event_tracks, dependent: :restrict_with_error

  validates_presence_of :event, :discipline

  delegate :range_from, to: :event
  delegate :range_to, to: :event

  before_create :set_number

  def signed_off
    signed_off_by.present?
  end

  def best_result(net: false)
    value_key = net ? :result_net : :result

    event_tracks.reject(&:is_disqualified).max_by(&value_key)
  end

  private

  def set_number
    current_number =
      Round
      .where(event_id: event_id, discipline: Round.disciplines[discipline])
      .maximum(:number) || 0

    self.number = current_number + 1
  end
end
