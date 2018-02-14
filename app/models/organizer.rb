# == Schema Information
#
# Table name: event_organizers
#
#  id         :integer          not null, primary key
#  event_id   :integer
#  profile_id :integer
#  created_at :datetime
#  updated_at :datetime
#

class Organizer < ApplicationRecord
  include EventOngoingValidation

  belongs_to :organizable, polymorphic: true
  belongs_to :profile

  validates :organizable, :profile, presence: true

  delegate :name, to: :profile, allow_nil: true

  alias event organizable
end
