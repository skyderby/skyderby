class VirtualCompetition < ApplicationRecord
  module Membership
    extend ActiveSupport::Concern

    included do
      has_many :participants, dependent: :delete_all
      has_many :participant_profiles, through: :participants, source: :profile

      scope :listed, -> { public_competition }
      scope :open_to_profile, lambda { |profile_id|
        listed.or(where(id: Participant.where(profile_id:).select(:virtual_competition_id)))
      }
      scope :listable, lambda { |user|
        next all if user&.admin?
        next listed unless user&.registered?

        open_to_profile(user.profile&.id)
      }
    end

    def members_only? = !public_competition?

    def participants_roster = ParticipantsRoster.new(self)

    def viewable?(user) = !private_competition? || manageable_by?(user) || participant?(user&.profile)

    def manageable_by?(user)
      return false unless user&.registered?

      user.admin? || participants.admins.exists?(profile: user.profile)
    end

    def participant?(profile) = profile.present? && participants.exists?(profile:)
  end
end
