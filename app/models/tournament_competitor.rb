# == Schema Information
#
# Table name: tournament_competitors
#
#  id            :integer          not null, primary key
#  tournament_id :integer
#  profile_id    :integer
#  wingsuit_id   :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class TournamentCompetitor < ApplicationRecord
  attr_accessor :profile_attributes, :profile_mode

  belongs_to :tournament
  belongs_to :profile
  belongs_to :wingsuit

  has_many :tournament_match_competitors, dependent: :restrict_with_error
  has_many :qualification_jumps, dependent: :restrict_with_error

  delegate :name, to: :profile, allow_nil: true
  delegate :country_id, to: :profile, allow_nil: true
  delegate :country_name, to: :profile, allow_nil: true
  delegate :country_code, to: :profile, allow_nil: true
  delegate :name, to: :wingsuit, prefix: true, allow_nil: true

  before_validation :create_profile

  private

  def create_profile
    return if profile || profile_mode.to_sym == :select

    self.profile = Profile.create profile_attributes
  end
private

  def create_profile
    return if profile || profile_mode.to_sym == :select

    self.profile = Profile.create profile_attributes
  end

end
