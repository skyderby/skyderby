# == Schema Information
#
# Table name: organizers
#
#  id               :integer          not null, primary key
#  organizable_id   :integer
#  profile_id       :integer
#  created_at       :datetime
#  updated_at       :datetime
#  organizable_type :string
#

class Organizer < ApplicationRecord
  include EventOngoingValidation

  belongs_to :organizable, polymorphic: true
  belongs_to :user

  validates :organizable, :user, presence: true

  delegate :name, to: :user, allow_nil: true

  alias event organizable
end
